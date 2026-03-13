import json
import os
import re
import ssl as ssl_module
import unicodedata
import urllib.error
import urllib.request
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
	import pymysql
except ImportError:  # pragma: no cover
	pymysql = None

try:
	import certifi
except ImportError:  # pragma: no cover
	certifi = None


class ChatRequest(BaseModel):
	question: str = Field(..., min_length=2)
	family_id: Optional[int] = None
	patient_id: Optional[int] = None
	caregiver_id: Optional[int] = None


class ChatResponse(BaseModel):
	category: str
	intent: str
	answer: str
	data: Dict[str, Any] = Field(default_factory=dict)
	suggestions: List[str] = Field(default_factory=list)
	requires_fields: List[str] = Field(default_factory=list)


@dataclass
class IntentRoute:
	category: str
	intent: str
	keywords: Tuple[str, ...]


class DatabaseClient:
	def __init__(self, appsettings_path: Optional[Path] = None):
		if pymysql is None:
			raise RuntimeError(
				"Missing dependency 'pymysql'. Install with: pip install pymysql fastapi uvicorn"
			)

		resolved_path = appsettings_path or self._default_appsettings_path()
		if not resolved_path.exists():
			raise RuntimeError(f"appsettings.json not found at: {resolved_path}")

		with resolved_path.open("r", encoding="utf-8") as f:
			cfg = json.load(f)

		conn_string = cfg.get("ConnectionStrings", {}).get("DefaultConnection")
		if not conn_string:
			raise RuntimeError("ConnectionStrings:DefaultConnection not found in appsettings")

		self.connection_kwargs = self._parse_conn_string(conn_string)

	@staticmethod
	def _default_appsettings_path() -> Path:
		current = Path(__file__).resolve()
		return current.parent.parent / "BE" / "appsettings.json"

	@staticmethod
	def _parse_conn_string(connection_string: str) -> Dict[str, Any]:
		pairs: Dict[str, str] = {}
		for part in connection_string.split(";"):
			piece = part.strip()
			if not piece or "=" not in piece:
				continue
			key, value = piece.split("=", 1)
			pairs[key.strip().lower()] = value.strip()

		host = pairs.get("server")
		user = pairs.get("user id") or pairs.get("uid") or pairs.get("user")
		password = pairs.get("password") or pairs.get("pwd")
		database = pairs.get("database")
		port = int(pairs.get("port", "3306"))

		if not all([host, user, password, database]):
			raise RuntimeError("Invalid DB connection string in appsettings")

		ssl_mode = pairs.get("sslmode", "").lower()
		ssl_kwargs: Dict[str, Any] = {}
		if ssl_mode in {"required", "verifyca", "verifyfull"}:
			ca_bundle = certifi.where() if certifi else ssl_module.get_default_verify_paths().cafile
			if not ca_bundle:
				raise RuntimeError(
					"SSL is required by DB but no CA bundle found. Install certifi: pip install certifi"
				)

			# TiDB Cloud requires TLS transport; providing a CA bundle enables secure transport.
			ssl_kwargs = {"ssl": {"ca": ca_bundle}}

		return {
			"host": host,
			"user": user,
			"password": password,
			"database": database,
			"port": port,
			"cursorclass": pymysql.cursors.DictCursor,
			"connect_timeout": int(pairs.get("connection timeout", "30")),
			**ssl_kwargs,
		}

	def query(self, sql: str, params: Tuple[Any, ...] = ()) -> List[Dict[str, Any]]:
		try:
			connection = pymysql.connect(**self.connection_kwargs)
			try:
				with connection.cursor() as cursor:
					cursor.execute(sql, params)
					rows = cursor.fetchall()
				return list(rows)
			finally:
				connection.close()
		except Exception as ex:
			raise RuntimeError(f"DB query failed: {ex}")


class LLMClient:
	def __init__(self):
		self.api_key = self._load_api_key()
		self.api_base = os.getenv("LLM_API_BASE", "https://api.groq.com/openai/v1")
		self.model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
		self.timeout = int(os.getenv("LLM_TIMEOUT_SECONDS", "25"))

		if not self.api_key:
			raise RuntimeError(
				"LLM key not found. Put key in Python/secret-key.txt (or secretkey.txt), or set LLM_API_KEY."
			)

	@staticmethod
	def _load_api_key() -> str:
		env_key = os.getenv("LLM_API_KEY", "").strip()
		if env_key:
			return env_key

		base = Path(__file__).resolve().parent
		candidates = [base / "secret-key.txt", base / "secretkey.txt"]
		for file_path in candidates:
			if file_path.exists():
				key = file_path.read_text(encoding="utf-8").strip()
				if key:
					return key
		return ""

	@staticmethod
	def _safe_json_text(value: Any, max_len: int = 2800) -> str:
		try:
			text = json.dumps(value, ensure_ascii=False, default=str)
		except Exception:
			text = str(value)
		if len(text) > max_len:
			return text[:max_len] + "..."
		return text

	def rewrite_answer(self, question: str, response: "ChatResponse") -> str:
		system_prompt = (
			"Bạn là chuyên viên tư vấn HomeCare, nói chuyện tự nhiên như người thật, ấm áp và chủ động. "
			"Nhiệm vụ: diễn đạt lại câu trả lời sao cho dễ hiểu, linh hoạt theo đúng câu hỏi của khách. "
			"Chỉ dùng dữ liệu đã có trong CONTEXT, không bịa thông tin mới. "
			"Nếu thiếu dữ liệu thì nói rõ đang thiếu gì và hỏi 1 câu ngắn để lấy thêm nhu cầu. "
			"Không lặp lại mẫu mở đầu cứng nhắc giữa các câu trả lời. "
			"Với nội dung sức khỏe, chỉ trả kiến thức chung, không chẩn đoán bệnh."
		)

		user_prompt = (
			f"QUESTION:\n{question}\n\n"
			f"CONTEXT_INTENT:\ncategory={response.category}, intent={response.intent}\n\n"
			f"CONTEXT_ANSWER:\n{response.answer}\n\n"
			f"CONTEXT_DATA:\n{self._safe_json_text(response.data)}\n\n"
			"YÊU CẦU TRẢ LỜI:\n"
			"- Trả lời trong 1-2 đoạn ngắn, dễ đọc.\n"
			"- Nếu có bước thao tác, trình bày dạng 1), 2), 3).\n"
			"- Nếu câu hỏi còn rộng, gợi ý 2-3 lựa chọn dịch vụ cụ thể theo dữ liệu có sẵn.\n"
			"- Kết câu bằng 1 câu hỏi ngắn để chốt nhu cầu tiếp theo nếu phù hợp.\n"
			"- Không nhắc tới từ 'CONTEXT' hay 'database'."
		)

		payload = {
			"model": self.model,
			"temperature": 0.45,
			"messages": [
				{"role": "system", "content": system_prompt},
				{"role": "user", "content": user_prompt},
			],
		}

		body = json.dumps(payload).encode("utf-8")
		request = urllib.request.Request(
			url=f"{self.api_base.rstrip('/')}/chat/completions",
			data=body,
			headers={
				"Content-Type": "application/json",
				"Authorization": f"Bearer {self.api_key}",
			},
			method="POST",
		)

		try:
			with urllib.request.urlopen(request, timeout=self.timeout) as resp:
				raw = resp.read().decode("utf-8")
				obj = json.loads(raw)
				content = (
					obj.get("choices", [{}])[0]
					.get("message", {})
					.get("content", "")
					.strip()
				)
				return content or response.answer
		except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
			return response.answer


class HomeCareChatbot:
	def __init__(self, db: DatabaseClient):
		self.db = db
		self.routes: List[IntentRoute] = [
			IntentRoute("service_support", "create_care_request", ("tao yeu cau", "yeu cau cham soc", "dang ky cham soc")),
			IntentRoute("service_support", "service_pricing", ("chi phi", "gia dich vu", "bao nhieu tien", "phi dich vu", "dich vu gi", "co nhung dich vu", "goi dich vu", "tu van dich vu")),
			IntentRoute("service_support", "caregiver_tasks", ("caregiver lam", "cong viec gi", "nhiem vu", "lam nhung gi")),
			IntentRoute("service_support", "weekly_booking", ("theo tuan", "dat lich tuan", "lich theo tuan")),
			IntentRoute("service_support", "change_caregiver", ("thay doi caregiver", "doi caregiver", "chuyen caregiver")),
			IntentRoute("schedule_support", "today_schedule", ("hom nay", "lich cham soc hom nay", "co lich khong")),
			IntentRoute("schedule_support", "next_schedule", ("lich tiep theo", "khi nao", "lich ke tiep")),
			IntentRoute("schedule_support", "change_schedule_time", ("doi thoi gian", "thay doi thoi gian", "doi gio")),
			IntentRoute("schedule_support", "checkin_status", ("check in", "checkin", "da check in", "da check-in")),
			IntentRoute("care_monitoring", "today_health_status", ("tinh trang suc khoe", "hom nay suc khoe", "suc khoe hom nay")),
			IntentRoute("care_monitoring", "care_log_updated", ("care log", "cap nhat log", "nhat ky cham soc")),
			IntentRoute("care_monitoring", "incident_today", ("incident", "su co", "tai nan", "co van de")),
			IntentRoute("care_monitoring", "medication_today", ("uong thuoc", "da dung thuoc", "thuoc hom nay")),
			IntentRoute("health_support", "general_health_knowledge", ("ngu bao nhieu gio", "an uong", "dau hieu", "nen an gi", "nen ngu")),
			IntentRoute("caregiver_support", "who_is_my_caregiver", ("caregiver cua toi", "ai dang cham", "ai la caregiver")),
			IntentRoute("caregiver_support", "caregiver_experience", ("kinh nghiem", "bao nhieu nam")),
			IntentRoute("caregiver_support", "caregiver_alzheimer", ("alzheimer", "sa sut tri tue", "mat tri nho")),
			IntentRoute("caregiver_support", "caregiver_rating", ("danh gia caregiver", "feedback caregiver", "rating caregiver")),
			IntentRoute("system_help", "forgot_password", ("quen mat khau", "forgot password", "reset mat khau")),
			IntentRoute("system_help", "update_patient_info", ("cap nhat thong tin benh nhan", "sua thong tin benh nhan")),
			IntentRoute("system_help", "payment_history", ("lich su thanh toan", "xem thanh toan", "lich su chi tra")),
			IntentRoute("emergency", "fall_response", ("bi nga", "te nga", "nga", "khan cap")),
			IntentRoute("emergency", "contact_caregiver_now", ("lien he caregiver", "goi caregiver", "lien he ngay")),
			IntentRoute("emergency", "system_emergency_support", ("ho tro khan cap", "goi khan cap", "sos")),
		]

	@staticmethod
	def _normalize(text: str) -> str:
		text = text.replace("Đ", "D").replace("đ", "d")
		text = text.lower().strip()
		text = unicodedata.normalize("NFD", text)
		text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
		text = re.sub(r"[^a-z0-9\s-]", " ", text)
		text = re.sub(r"\s+", " ", text).strip()
		return text

	@staticmethod
	def _fmt_currency(value: Optional[Any]) -> str:
		if value is None:
			return "N/A"
		amount = float(value) if isinstance(value, Decimal) else float(value)
		return f"{amount:,.0f} VND".replace(",", ".")

	def _find_route(self, intent: str) -> IntentRoute:
		for route in self.routes:
			if route.intent == intent:
				return route
		return IntentRoute("general", "general_consultation", tuple())

	@staticmethod
	def _token_overlap_score(normalized_question: str, keyword: str) -> float:
		if not keyword:
			return 0.0
		if keyword in normalized_question:
			return 1.0

		q_tokens = set(normalized_question.split())
		k_tokens = set(keyword.split())
		if not q_tokens or not k_tokens:
			return 0.0

		overlap = len(q_tokens & k_tokens)
		return overlap / len(k_tokens)

	def _safe_query(self, sql: str, params: Tuple[Any, ...] = ()) -> List[Dict[str, Any]]:
		try:
			return self.db.query(sql, params)
		except Exception:
			return []

	def _rank_services_by_question(self, question: str, services: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
		normalized_q = self._normalize(question)
		q_tokens = set(normalized_q.split())
		ranked: List[Tuple[float, float, Dict[str, Any]]] = []
		for service in services:
			search_text = self._normalize(
				" ".join(
					[
						str(service.get("Name") or ""),
						str(service.get("Category") or ""),
						str(service.get("Description") or ""),
					]
				)
			)
			s_tokens = set(search_text.split())
			if not q_tokens or not s_tokens:
				match_score = 0.0
			else:
				match_score = len(q_tokens & s_tokens) / len(q_tokens)

			bonus = 0.0
			if any(k in normalized_q for k in ("alzheimer", "sa sut tri tue", "mat tri nho", "dementia")):
				if "dementia" in search_text or "alzheimer" in search_text:
					bonus += 0.7
			if any(k in normalized_q for k in ("di lai yeu", "te nga", "yeu chan", "hau phau thuat", "phuc hoi")):
				if "post surgery" in search_text or "specialized" in search_text or "premium" in search_text:
					bonus += 1.1
			if any(k in normalized_q for k in ("nguoi lon tuoi", "78 tuoi", "cao tuoi", "ong", "ba")):
				if "daily care" in search_text or "companionship" in search_text:
					bonus += 0.4

			match_score += bonus
			price = float(service.get("PricePerHour") or 0)
			ranked.append((match_score, -price, service))

		ranked.sort(key=lambda x: (x[0], x[1]), reverse=True)
		return [item[2] for item in ranked]

	def _pick_recommended_services(self, question: str, services: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
		normalized_q = self._normalize(question)

		def service_text(service: Dict[str, Any]) -> str:
			return self._normalize(
				" ".join(
					[
						str(service.get("Name") or ""),
						str(service.get("Category") or ""),
						str(service.get("Description") or ""),
					]
				)
			)

		mobility_keywords = ("di lai yeu", "yeu chan", "hau phau thuat", "phuc hoi", "te nga")
		dementia_keywords = ("alzheimer", "sa sut tri tue", "mat tri nho", "dementia")

		if any(k in normalized_q for k in dementia_keywords):
			prioritized = [
				s for s in services if any(k in service_text(s) for k in ("dementia", "alzheimer", "specialized"))
			]
			if prioritized:
				base = prioritized + [s for s in services if s not in prioritized]
				return base[:top_k]

		if any(k in normalized_q for k in mobility_keywords):
			prioritized = [
				s
				for s in services
				if any(k in service_text(s) for k in ("post surgery", "recovery", "specialized", "premium"))
			]
			if prioritized:
				base = prioritized + [s for s in services if s not in prioritized]
				return base[:top_k]

		ranked = self._rank_services_by_question(question, services)
		return ranked[:top_k]

	def _find_target_service(self, question: str, services: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
		matches = self._find_target_services(question, services)
		return matches[0] if matches else None

	def _find_target_services(self, question: str, services: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
		normalized_q = self._normalize(question)
		alias_map = {
			"basic": ("basic", "goi basic", "basic home care", "co ban"),
			"premium": ("premium", "goi premium", "premium home care", "cao cap"),
			"specialized": ("specialized", "specialized care", "chuyen sau", "chuyen mon"),
			"post surgery": ("post surgery", "hau phau thuat", "phuc hoi sau phau thuat", "recovery"),
			"dementia": ("dementia", "alzheimer", "sa sut tri tue", "mat tri nho"),
			"social": ("social enrichment", "companionship", "ban hanh", "tro chuyen", "giao tiep"),
		}

		matches: List[Dict[str, Any]] = []
		for service in services:
			service_name = self._normalize(str(service.get("Name") or ""))
			service_category = self._normalize(str(service.get("Category") or ""))
			for aliases in alias_map.values():
				if any(alias in normalized_q and (alias in service_name or alias in service_category) for alias in aliases):
					if service not in matches:
						matches.append(service)
			if service_name and service_name in normalized_q:
				if service not in matches:
					matches.append(service)

		return matches

	def _get_service_top_caregivers(self, service_id: int) -> List[Dict[str, Any]]:
		return self._safe_query(
			"""
			SELECT cg.Id,
			       cg.FullName,
			       cg.Specialization,
			       cg.ExperienceYears,
			       COUNT(DISTINCT c.Id) AS TotalAssignments,
			       AVG(f.Rating) AS AvgRating
			FROM Contracts c
			JOIN Caregivers cg ON cg.Id = c.AssignedCaregiverId
			LEFT JOIN Feedbacks f ON f.CaregiverId = cg.Id
			WHERE c.ServiceId = %s AND c.AssignedCaregiverId IS NOT NULL
			GROUP BY cg.Id, cg.FullName, cg.Specialization, cg.ExperienceYears
			ORDER BY TotalAssignments DESC, AvgRating DESC, ExperienceYears DESC
			LIMIT 3
			""",
			(service_id,),
		)

	@staticmethod
	def _feature_points(description: Optional[str]) -> List[str]:
		if not description:
			return []
		parts = [part.strip(" .") for part in re.split(r",| and ", description) if part.strip()]
		return parts[:4]

	@staticmethod
	def _localize_feature(point: str) -> str:
		text = point.strip()
		normalized = HomeCareChatbot._normalize(text)
		mapping = [
			("essential daily care including medication reminders", "hỗ trợ chăm sóc sinh hoạt cơ bản và nhắc thuốc"),
			("meal assistance", "hỗ trợ bữa ăn"),
			("basic health monitoring", "theo dõi sức khỏe cơ bản"),
			("companionship for seniors including conversation", "đồng hành và trò chuyện cùng người lớn tuổi"),
			("games", "hoạt động giải trí nhẹ"),
			("walking", "đi dạo hoặc vận động nhẹ"),
			("social activities to prevent isolation", "tăng tương tác xã hội, giảm cảm giác cô lập"),
			("specialized support for patients with alzheimer s or dementia", "hỗ trợ chuyên biệt cho người bệnh Alzheimer hoặc sa sút trí tuệ"),
			("focus on safety", "ưu tiên an toàn trong sinh hoạt"),
			("routine", "duy trì nếp sinh hoạt ổn định"),
			("cognitive engagement", "khuyến khích tương tác nhận thức"),
			("recovery support after surgery", "hỗ trợ phục hồi sau phẫu thuật"),
			("mobility assistance", "hỗ trợ đi lại và vận động"),
		]
		for source, target in mapping:
			if source in normalized:
				return target
		return text

	def _build_service_comparison_answer(self, first: Dict[str, Any], second: Dict[str, Any]) -> str:
		first_features = [self._localize_feature(item) for item in self._feature_points(first.get("Description"))]
		second_features = [self._localize_feature(item) for item in self._feature_points(second.get("Description"))]

		first_lines = [
			f"- {first['Name']}: {self._fmt_currency(first.get('PricePerHour'))}/giờ",
			f"- Nhóm dịch vụ: {first.get('Category') or 'Khác'}",
		]
		if first.get("ContractPricePerMonth") is not None:
			first_lines.append(f"- Gói tháng: {self._fmt_currency(first.get('ContractPricePerMonth'))}")
		if first_features:
			first_lines.append(f"- Điểm mạnh: {'; '.join(first_features)}")

		second_lines = [
			f"- {second['Name']}: {self._fmt_currency(second.get('PricePerHour'))}/giờ",
			f"- Nhóm dịch vụ: {second.get('Category') or 'Khác'}",
		]
		if second.get("ContractPricePerMonth") is not None:
			second_lines.append(f"- Gói tháng: {self._fmt_currency(second.get('ContractPricePerMonth'))}")
		if second_features:
			second_lines.append(f"- Điểm mạnh: {'; '.join(second_features)}")

		return (
			f"Nếu so sánh nhanh giữa {first['Name']} và {second['Name']}, anh/chị có thể hiểu như sau:\n\n"
			+ "\n".join(first_lines)
			+ "\n\n"
			+ "\n".join(second_lines)
			+ "\n\n"
			+ "Nếu anh/chị cần hỗ trợ sinh hoạt hằng ngày ở mức cơ bản thì nên nghiêng về gói cơ bản. Nếu muốn chăm kỹ hơn, theo dõi sát hơn hoặc cần chất lượng dịch vụ cao hơn thì nên cân nhắc gói premium. Anh/chị muốn em chốt giúp phương án nào hợp ngân sách hơn?"
		)

	def _build_service_focus_answer(
		self,
		question: str,
		service: Dict[str, Any],
		caregivers: List[Dict[str, Any]],
		all_services: List[Dict[str, Any]],
	) -> str:
		normalized_q = self._normalize(question)
		service_name = service.get("Name") or "Gói dịch vụ này"
		category = service.get("Category") or "Khác"
		description = str(service.get("Description") or "")
		features = [self._localize_feature(item) for item in self._feature_points(description)]
		price_hour = self._fmt_currency(service.get("PricePerHour"))
		price_month = self._fmt_currency(service.get("ContractPricePerMonth"))

		parts: List[str] = []
		intro = (
			f"Nếu anh/chị đang cân nhắc {service_name}, đây là gói thuộc nhóm {category.lower()}"
			f" với mức phí {price_hour}/giờ"
		)
		if service.get("ContractPricePerMonth") is not None:
			intro += f" và gói tháng khoảng {price_month}"
		intro += "."
		parts.append(intro)

		if features:
			parts.append("Điểm nổi bật của gói này là: " + "; ".join(features) + ".")
		elif description:
			parts.append(description)

		if any(token in normalized_q for token in ("noi bat", "phu hop", "danh cho ai", "co gi", "gom gi", "cham soc sinh hoat")):
			if "daily care" in self._normalize(category):
				parts.append(
					"Gói này hợp với trường hợp cần hỗ trợ sinh hoạt hằng ngày, nhắc thuốc, hỗ trợ ăn uống và theo dõi cơ bản tại nhà."
				)
			elif "companionship" in self._normalize(category):
				parts.append(
					"Gói này hợp khi gia đình muốn người lớn tuổi có người trò chuyện, đồng hành và giảm cảm giác cô lập."
				)
			else:
				parts.append(
					"Gói này phù hợp hơn với nhu cầu cần theo dõi chuyên sâu hoặc người bệnh cần chăm sóc có chuyên môn hơn mức hỗ trợ sinh hoạt cơ bản."
				)

		if any(token in normalized_q for token in ("dieu duong", "caregiver", "ai", "noi bat", "kinh nghiem")):
			if caregivers:
				cg_lines = []
				for caregiver in caregivers:
					avg_rating = caregiver.get("AvgRating")
					rating_text = f", rating trung bình {float(avg_rating):.1f}/5" if avg_rating is not None else ""
					cg_lines.append(
						f"- {caregiver['FullName']} ({caregiver.get('Specialization') or 'chuyên môn chưa cập nhật'}, {caregiver.get('ExperienceYears', 0)} năm kinh nghiệm, {caregiver.get('TotalAssignments', 0)} ca đã phân công{rating_text})"
					)
				parts.append(
					"Theo dữ liệu phân công trước đây, một số caregiver từng phụ trách gói này là:\n" + "\n".join(cg_lines)
				)
				parts.append(
					"Gói dịch vụ không cố định sẵn một điều dưỡng. Khi tạo yêu cầu, hệ thống sẽ ưu tiên caregiver phù hợp lịch trống và chuyên môn."
				)
			else:
				parts.append(
					"Hiện em chưa thấy caregiver nổi bật nào đã được gắn lịch sử đủ rõ cho riêng gói này. Khi anh/chị đặt lịch, bên mình sẽ ghép người phù hợp theo chuyên môn và lịch trống."
				)

		alternatives = [s for s in self._pick_recommended_services(question, all_services, top_k=3) if s.get("Id") != service.get("Id")]
		if alternatives and any(token in normalized_q for token in ("so sanh", "khac", "nen chon", "phu hop")):
			alt_lines = [f"- {s['Name']}: {self._fmt_currency(s['PricePerHour'])}/giờ" for s in alternatives[:2]]
			parts.append("Nếu anh/chị muốn so sánh thêm, em gợi ý cân nhắc cùng: \n" + "\n".join(alt_lines))

		parts.append("Anh/chị muốn em tư vấn tiếp theo hướng so sánh các gói, chi phí tháng hay chọn caregiver phù hợp?")
		return "\n\n".join(parts)

	def detect_intent(self, question: str) -> IntentRoute:
		normalized = self._normalize(question)

		# If user explicitly asks about package/service/pricing, prioritize service consulting.
		if any(k in normalized for k in ("dich vu", "goi", "bao gia", "chi phi", "gia")):
			return self._find_route("service_pricing")

		# Pass 1: exact phrase contains.
		for route in self.routes:
			if any(k in normalized for k in route.keywords):
				return route

		# Pass 2: token-overlap scoring to handle natural phrasing.
		best_route: Optional[IntentRoute] = None
		best_score = 0.0
		for route in self.routes:
			for keyword in route.keywords:
				score = self._token_overlap_score(normalized, keyword)
				if score > best_score:
					best_score = score
					best_route = route

		if best_route and best_score >= 0.6:
			return best_route

		# Pass 3: high-value business rules for broad consulting questions.
		if any(k in normalized for k in ("lich", "check in", "checkin", "hom nay")):
			return self._find_route("today_schedule")

		return IntentRoute("general", "general_consultation", tuple())

	def answer(self, request: ChatRequest) -> ChatResponse:
		route = self.detect_intent(request.question)
		if route.intent == "fallback":
			route = self._find_route("general_consultation")
		handler_name = f"handle_{route.intent}"
		if hasattr(self, handler_name):
			return getattr(self, handler_name)(request, route)
		return self.handle_fallback(request, route)

	def _require_any_id(self, req: ChatRequest, route: IntentRoute, fields: List[str]) -> Optional[ChatResponse]:
		values = [getattr(req, name) for name in fields]
		if any(v is not None for v in values):
			return None
		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer="Mình cần thêm thông tin định danh để tra dữ liệu từ hệ thống.",
			requires_fields=fields,
			suggestions=["Thử gửi kèm patient_id hoặc family_id", "Ví dụ: question + patient_id=1"],
		)

	def handle_create_care_request(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		services = self.db.query(
			"""
			SELECT Id, Name, Category, PricePerHour, ContractPricePerMonth
			FROM Services
			WHERE IsActive = 1
			ORDER BY PricePerHour ASC
			"""
		)
		service_lines = [
			f"- {s['Name']}: {self._fmt_currency(s['PricePerHour'])}/giờ, gói tháng {self._fmt_currency(s['ContractPricePerMonth'])}"
			for s in services
		]
		answer = (
			"Để tạo yêu cầu chăm sóc cho người thân, bạn làm theo các bước:\n"
			"1) Chọn bệnh nhân cần chăm sóc.\n"
			"2) Chọn gói dịch vụ phù hợp.\n"
			"3) Chọn loại yêu cầu (OneTime/Flexible/Contract), ngày và khung giờ.\n"
			"4) Xác nhận địa chỉ, ghi chú y tế, gửi yêu cầu.\n"
			"5) Theo dõi trạng thái: Pending -> Approved/AwaitingPayment -> Assigned.\n\n"
			"Các dịch vụ đang hoạt động:\n"
			+ "\n".join(service_lines)
		)
		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"services": services},
			suggestions=["Chi phí dịch vụ chăm sóc là bao nhiêu?", "Tôi có thể đặt lịch chăm sóc theo tuần không?"],
		)

	def handle_service_pricing(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		services = self.db.query(
			"""
			SELECT Id, Name, Category, Description, PricePerHour, ContractPricePerMonth
			FROM Services
			WHERE IsActive = 1
			ORDER BY PricePerHour ASC
			"""
		)

		if not services:
			return ChatResponse(
				category=route.category,
				intent=route.intent,
				answer="Hiện chưa có dịch vụ đang hoạt động trong hệ thống. Anh/chị để lại nhu cầu, em sẽ hỗ trợ ngay khi danh mục được cập nhật.",
			)

		target_services = self._find_target_services(req.question, services)
		if len(target_services) >= 2 and any(token in self._normalize(req.question) for token in ("khac", "so sanh", "chon", "hon")):
			answer = self._build_service_comparison_answer(target_services[0], target_services[1])
			return ChatResponse(
				category=route.category,
				intent=route.intent,
				answer=answer,
				data={"services": services, "compared_services": target_services[:2]},
				suggestions=[
					"Gói nào hợp với người cần chăm sóc sinh hoạt hằng ngày?",
					"Chi phí tháng của hai gói này là bao nhiêu?",
					"Nếu ngân sách vừa phải thì nên chọn gói nào?",
				],
			)

		target_service = target_services[0] if target_services else None
		if target_service:
			caregivers = self._get_service_top_caregivers(int(target_service["Id"]))
			answer = self._build_service_focus_answer(req.question, target_service, caregivers, services)
			return ChatResponse(
				category=route.category,
				intent=route.intent,
				answer=answer,
				data={
					"service": target_service,
					"related_caregivers": caregivers,
					"services": services,
				},
				suggestions=[
					"Gói basic khác gì premium?",
					"Chi phí gói này theo tháng là bao nhiêu?",
					"Caregiver nào phù hợp với nhu cầu này?",
				],
			)

		recommended = self._pick_recommended_services(req.question, services, top_k=3)
		reco_lines = [
			f"- {s['Name']} ({s['Category']}): {self._fmt_currency(s['PricePerHour'])}/giờ, gói tháng {self._fmt_currency(s['ContractPricePerMonth'])}"
			for s in recommended
		]
		all_lines = [
			f"- {s['Name']} ({s['Category']}): {self._fmt_currency(s['PricePerHour'])}/giờ"
			for s in services
		]

		answer = (
			"Dạ HomeCare hiện có các dịch vụ chăm sóc tại nhà theo giờ và theo gói. "
			"Với nhu cầu anh/chị vừa hỏi, em gợi ý nhanh 3 lựa chọn phù hợp:\n"
			+ "\n".join(reco_lines)
			+ "\n\nDanh mục hiện có:\n"
			+ "\n".join(all_lines)
			+ "\n\nAnh/chị muốn em tư vấn kỹ theo nhu cầu nào trước: chăm sóc sinh hoạt hằng ngày, theo dõi sức khỏe, hay chăm sóc chuyên sâu?"
		)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"services": services, "recommended_services": recommended},
			suggestions=[
				"Bên mình có những dịch vụ nào?",
				"Chi phí từng gói chăm sóc là bao nhiêu?",
				"Nên chọn gói theo giờ hay theo tháng?",
			],
		)

	def handle_caregiver_tasks(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		services = self.db.query(
			"SELECT Name, Description FROM Services WHERE IsActive = 1 ORDER BY Id ASC"
		)
		lines = [f"- {s['Name']}: {s['Description']}" for s in services]
		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=(
				"Caregiver thường thực hiện các công việc: hỗ trợ sinh hoạt hằng ngày, nhắc/cho uống thuốc theo hướng dẫn, "
				"hỗ trợ bữa ăn, theo dõi chỉ số cơ bản và cập nhật Care Log.\n\n"
				"Theo các gói đang có:\n" + "\n".join(lines)
			),
			data={"services": services},
			suggestions=["Caregiver có kinh nghiệm bao nhiêu năm?", "Hôm nay caregiver đã check-in chưa?"],
		)

	def handle_weekly_booking(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		weekly_info = []
		if req.family_id:
			weekly_info = self.db.query(
				"""
				SELECT Id, Status, WeeklySchedule, StartDate, EndDate
				FROM Contracts
				WHERE FamilyId = %s
				ORDER BY CreatedAt DESC
				LIMIT 1
				""",
				(req.family_id,),
			)

		if weekly_info and weekly_info[0].get("WeeklySchedule"):
			answer = (
				"Bạn hoàn toàn có thể đặt lịch theo tuần. Hợp đồng gần nhất của bạn đã có WeeklySchedule. "
				"Bạn có thể yêu cầu admin/cs cập nhật khung giờ nếu cần đổi lịch định kỳ."
			)
		else:
			answer = (
				"Có, hệ thống hỗ trợ lịch chăm sóc theo tuần thông qua Contract (trường WeeklySchedule). "
				"Bạn chọn loại yêu cầu Contract, sau đó cấu hình ngày trong tuần và khung giờ mong muốn."
			)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"latest_contract": weekly_info[0] if weekly_info else None},
			suggestions=["Làm sao để thay đổi caregiver?", "Lịch chăm sóc tiếp theo là khi nào?"],
		)

	def handle_change_caregiver(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["family_id", "patient_id"])
		if missing:
			return missing

		where_clause = "c.FamilyId = %s" if req.family_id else "c.PatientId = %s"
		param = req.family_id if req.family_id else req.patient_id
		rows = self.db.query(
			f"""
			SELECT c.Id, c.Status, c.AssignedCaregiverId, cg.FullName
			FROM Contracts c
			LEFT JOIN Caregivers cg ON cg.Id = c.AssignedCaregiverId
			WHERE {where_clause}
			ORDER BY c.CreatedAt DESC
			LIMIT 1
			""",
			(param,),
		)

		contract = rows[0] if rows else None
		if not contract:
			text = "Mình chưa thấy hợp đồng phù hợp để đổi caregiver. Bạn cần có contract đã tạo trước."
		else:
			current = contract.get("FullName") or "chưa phân công"
			text = (
				f"Caregiver hiện tại: {current}. Để đổi caregiver, bạn gửi yêu cầu hỗ trợ đổi người chăm sóc kèm lý do. "
				"Admin sẽ kiểm tra lịch trống, chuyên môn và cập nhật AssignedCaregiverId trên hợp đồng/yêu cầu."
			)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=text,
			data={"latest_contract": contract},
			suggestions=["Caregiver của tôi là ai?", "Caregiver có kinh nghiệm bao nhiêu năm?"],
		)

	def handle_today_schedule(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id", "caregiver_id"])
		if missing:
			return missing

		if req.patient_id:
			filter_sql = "s.PatientId = %s"
			filter_param = req.patient_id
		else:
			filter_sql = "s.CaregiverId = %s"
			filter_param = req.caregiver_id

		schedules = self.db.query(
			f"""
			SELECT s.Id, s.Date, s.StartTime, s.EndTime, s.Status, s.CheckInTime,
				   p.FullName AS PatientName, c.FullName AS CaregiverName
			FROM Schedules s
			JOIN Patients p ON p.Id = s.PatientId
			JOIN Caregivers c ON c.Id = s.CaregiverId
			WHERE DATE(s.Date) = CURDATE() AND {filter_sql}
			ORDER BY s.StartTime ASC
			""",
			(filter_param,),
		)

		if not schedules:
			answer = "Hôm nay chưa có lịch chăm sóc theo thông tin bạn cung cấp."
		else:
			rows = [
				f"- Lịch #{s['Id']}: {s['StartTime']} - {s['EndTime']}, trạng thái {s['Status']}, caregiver {s['CaregiverName']}"
				for s in schedules
			]
			answer = "Hôm nay có lịch chăm sóc:\n" + "\n".join(rows)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"today_schedules": schedules},
			suggestions=["Lịch chăm sóc tiếp theo là khi nào?", "Caregiver đã check-in chưa?"],
		)

	def handle_next_schedule(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id", "caregiver_id"])
		if missing:
			return missing

		if req.patient_id:
			filter_sql = "s.PatientId = %s"
			filter_param = req.patient_id
		else:
			filter_sql = "s.CaregiverId = %s"
			filter_param = req.caregiver_id

		rows = self.db.query(
			f"""
			SELECT s.Id, s.Date, s.StartTime, s.EndTime, s.Status,
				   p.FullName AS PatientName, c.FullName AS CaregiverName
			FROM Schedules s
			JOIN Patients p ON p.Id = s.PatientId
			JOIN Caregivers c ON c.Id = s.CaregiverId
			WHERE {filter_sql}
			  AND (s.Date > CURDATE() OR (DATE(s.Date) = CURDATE() AND s.StartTime >= CURTIME()))
			ORDER BY s.Date ASC, s.StartTime ASC
			LIMIT 1
			""",
			(filter_param,),
		)

		if not rows:
			answer = "Mình chưa thấy lịch chăm sóc sắp tới trong hệ thống."
			next_schedule = None
		else:
			s = rows[0]
			answer = (
				f"Lịch chăm sóc tiếp theo là lịch #{s['Id']} vào ngày {s['Date']} "
				f"từ {s['StartTime']} đến {s['EndTime']}, trạng thái {s['Status']}."
			)
			next_schedule = s

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"next_schedule": next_schedule},
			suggestions=["Tôi có thể thay đổi thời gian chăm sóc không?", "Hôm nay caregiver có lịch chăm sóc không?"],
		)

	def handle_change_schedule_time(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id", "caregiver_id"])
		if missing:
			return missing

		if req.patient_id:
			filter_sql = "PatientId = %s"
			filter_param = req.patient_id
		else:
			filter_sql = "CaregiverId = %s"
			filter_param = req.caregiver_id

		rows = self.db.query(
			f"""
			SELECT Id, Date, StartTime, EndTime, Status
			FROM Schedules
			WHERE {filter_sql}
			  AND (Date > CURDATE() OR (DATE(Date) = CURDATE() AND StartTime >= CURTIME()))
			ORDER BY Date ASC, StartTime ASC
			LIMIT 1
			""",
			(filter_param,),
		)

		if rows:
			s = rows[0]
			answer = (
				f"Bạn có thể yêu cầu đổi giờ cho lịch #{s['Id']} ({s['Date']} {s['StartTime']}-{s['EndTime']}). "
				"Hệ thống sẽ kiểm tra xung đột lịch caregiver trước khi cập nhật."
			)
		else:
			answer = "Bạn có thể đổi thời gian chăm sóc nếu lịch chưa hoàn thành/hủy. Mình chưa tìm thấy lịch sắp tới để gợi ý cụ thể."

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"upcoming_schedule": rows[0] if rows else None},
			suggestions=["Lịch chăm sóc tiếp theo là khi nào?", "Hôm nay caregiver đã check-in chưa?"],
		)

	def handle_checkin_status(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id", "caregiver_id"])
		if missing:
			return missing

		if req.patient_id:
			filter_sql = "s.PatientId = %s"
			filter_param = req.patient_id
		else:
			filter_sql = "s.CaregiverId = %s"
			filter_param = req.caregiver_id

		rows = self.db.query(
			f"""
			SELECT s.Id, s.Status, s.CheckInTime, s.CheckOutTime, s.StartTime, s.EndTime
			FROM Schedules s
			WHERE DATE(s.Date) = CURDATE() AND {filter_sql}
			ORDER BY s.StartTime ASC
			LIMIT 1
			""",
			(filter_param,),
		)

		if not rows:
			answer = "Hôm nay chưa có lịch để kiểm tra check-in."
			data = {}
		else:
			s = rows[0]
			if s["CheckInTime"]:
				answer = f"Caregiver đã check-in cho lịch #{s['Id']} lúc {s['CheckInTime']}."
			else:
				answer = f"Caregiver chưa check-in cho lịch #{s['Id']} (khung giờ {s['StartTime']} - {s['EndTime']})."
			data = s

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"today_checkin": data},
			suggestions=["Hôm nay caregiver có lịch chăm sóc không?", "Lịch chăm sóc tiếp theo là khi nào?"],
		)

	def handle_today_health_status(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id"])
		if missing:
			return missing

		log_rows = self.db.query(
			"""
			SELECT cl.LoggedAt, cl.PatientMood, cl.VitalSigns, cl.Notes, cl.Activities,
				   c.FullName AS CaregiverName
			FROM CareLogs cl
			JOIN Caregivers c ON c.Id = cl.CaregiverId
			WHERE cl.PatientId = %s AND DATE(cl.LoggedAt) = CURDATE()
			ORDER BY cl.LoggedAt DESC
			LIMIT 1
			""",
			(req.patient_id,),
		)
		report_rows = self.db.query(
			"""
			SELECT ReportDate, ReportType, Status, HealthScore, Notes
			FROM HealthReports
			WHERE PatientId = %s
			ORDER BY ReportDate DESC
			LIMIT 1
			""",
			(req.patient_id,),
		)

		answer_parts = []
		if log_rows:
			l = log_rows[0]
			answer_parts.append(
				f"Care log gần nhất hôm nay ({l['LoggedAt']}): mood={l.get('PatientMood') or 'N/A'}, "
				f"vital={l.get('VitalSigns') or 'N/A'}, hoạt động={l.get('Activities') or 'N/A'}."
			)
		if report_rows:
			r = report_rows[0]
			answer_parts.append(
				f"Health report mới nhất: {r['ReportType']} ({r['ReportDate']}), trạng thái {r['Status']}, điểm sức khỏe {r['HealthScore']}."
			)
		if not answer_parts:
			answer_parts.append("Hôm nay chưa có dữ liệu sức khỏe/care log cho bệnh nhân này.")

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer="\n".join(answer_parts),
			data={"care_log": log_rows[0] if log_rows else None, "health_report": report_rows[0] if report_rows else None},
			suggestions=["Caregiver đã cập nhật care log chưa?", "Có incident nào xảy ra không?"],
		)

	def handle_care_log_updated(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id"])
		if missing:
			return missing

		rows = self.db.query(
			"""
			SELECT COUNT(*) AS Total, MAX(LoggedAt) AS LastLoggedAt
			FROM CareLogs
			WHERE PatientId = %s AND DATE(LoggedAt) = CURDATE()
			""",
			(req.patient_id,),
		)
		total = int(rows[0]["Total"]) if rows else 0
		if total > 0:
			answer = f"Hôm nay caregiver đã cập nhật care log {total} lần. Lần gần nhất: {rows[0]['LastLoggedAt']}."
		else:
			answer = "Hôm nay chưa có care log nào được cập nhật cho bệnh nhân này."

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"today_carelog_count": total, "last_logged_at": rows[0]["LastLoggedAt"] if rows else None},
			suggestions=["Hôm nay tình trạng sức khỏe của bệnh nhân như thế nào?", "Có incident nào xảy ra không?"],
		)

	def handle_incident_today(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id"])
		if missing:
			return missing

		incidents = self.db.query(
			"""
			SELECT Id, Title, Severity, Status, OccurredAt, ActionTaken
			FROM Incidents
			WHERE PatientId = %s AND DATE(OccurredAt) = CURDATE()
			ORDER BY OccurredAt DESC
			""",
			(req.patient_id,),
		)

		if not incidents:
			answer = "Hôm nay không có incident nào được ghi nhận."
		else:
			lines = [
				f"- Incident #{i['Id']}: {i['Title']} | mức độ {i['Severity']} | trạng thái {i['Status']} | lúc {i['OccurredAt']}"
				for i in incidents
			]
			answer = "Có incident hôm nay:\n" + "\n".join(lines)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"incidents": incidents},
			suggestions=["Nếu bệnh nhân bị ngã thì phải làm gì?", "Hôm nay tình trạng sức khỏe của bệnh nhân như thế nào?"],
		)

	def handle_medication_today(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["patient_id"])
		if missing:
			return missing

		rows = self.db.query(
			"""
			SELECT MedicationsGiven, LoggedAt
			FROM CareLogs
			WHERE PatientId = %s
			  AND DATE(LoggedAt) = CURDATE()
			  AND MedicationsGiven IS NOT NULL
			  AND TRIM(MedicationsGiven) <> ''
			ORDER BY LoggedAt DESC
			LIMIT 1
			""",
			(req.patient_id,),
		)

		if not rows:
			answer = "Hôm nay chưa có ghi nhận dùng thuốc trong care log."
			med_data = None
		else:
			answer = f"Hôm nay đã có ghi nhận dùng thuốc: {rows[0]['MedicationsGiven']} (lúc {rows[0]['LoggedAt']})."
			med_data = rows[0]

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"medication_log": med_data},
			suggestions=["Caregiver đã cập nhật care log chưa?", "Có incident nào xảy ra không?"],
		)

	def handle_general_health_knowledge(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		q = self._normalize(req.question)
		if "ngu" in q:
			body = "Người cao tuổi thường cần khoảng 7-8 giờ ngủ mỗi ngày. Nếu mất ngủ kéo dài, nên đi khám để tìm nguyên nhân."
		elif "an" in q or "uong" in q:
			body = "Nên ưu tiên bữa ăn cân bằng: đủ đạm, rau xanh, chất xơ, uống đủ nước, hạn chế muối/đường/chất béo bão hòa."
		elif "dau hieu" in q or "di kham" in q:
			body = "Các dấu hiệu nên đi khám sớm: khó thở, đau ngực, lú lẫn tăng dần, sốt kéo dài, té ngã, bỏ ăn/uống rõ rệt."
		else:
			body = "Mình có thể cung cấp kiến thức chăm sóc sức khỏe cơ bản cho người cao tuổi, dinh dưỡng và theo dõi dấu hiệu bất thường."

		disclaimer = (
			"\n\nLưu ý: Đây là thông tin tham khảo chung, không thay thế chẩn đoán hoặc chỉ định của bác sĩ. "
			"Nếu có dấu hiệu nặng hoặc khẩn cấp, hãy liên hệ cơ sở y tế ngay."
		)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=body + disclaimer,
			suggestions=["Dấu hiệu nào cho thấy người cao tuổi cần đi khám bác sĩ?", "Hôm nay tình trạng sức khỏe của bệnh nhân như thế nào?"],
		)

	def handle_who_is_my_caregiver(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["family_id", "patient_id"])
		if missing:
			return missing

		where_clause = "c.FamilyId = %s" if req.family_id else "c.PatientId = %s"
		param = req.family_id if req.family_id else req.patient_id

		rows = self.db.query(
			f"""
			SELECT cg.Id, cg.FullName, cg.Specialization, cg.ExperienceYears, u.Phone, u.Email
			FROM Contracts c
			JOIN Caregivers cg ON cg.Id = c.AssignedCaregiverId
			JOIN Users u ON u.Id = cg.UserId
			WHERE {where_clause}
			ORDER BY c.CreatedAt DESC
			LIMIT 1
			""",
			(param,),
		)

		if not rows:
			answer = "Hiện chưa có caregiver được gán cho hồ sơ này."
			caregiver = None
		else:
			caregiver = rows[0]
			answer = (
				f"Caregiver của bạn là {caregiver['FullName']} "
				f"(chuyên môn: {caregiver.get('Specialization') or 'N/A'}, kinh nghiệm: {caregiver.get('ExperienceYears', 0)} năm)."
			)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"caregiver": caregiver},
			suggestions=["Caregiver có kinh nghiệm bao nhiêu năm?", "Làm sao để thay đổi caregiver?"],
		)

	def handle_caregiver_experience(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		if req.caregiver_id:
			rows = self.db.query(
				"SELECT Id, FullName, ExperienceYears, Specialization FROM Caregivers WHERE Id = %s",
				(req.caregiver_id,),
			)
		else:
			missing = self._require_any_id(req, route, ["family_id", "patient_id", "caregiver_id"])
			if missing:
				return missing
			where_clause = "c.FamilyId = %s" if req.family_id else "c.PatientId = %s"
			param = req.family_id if req.family_id else req.patient_id
			rows = self.db.query(
				f"""
				SELECT cg.Id, cg.FullName, cg.ExperienceYears, cg.Specialization
				FROM Contracts c
				JOIN Caregivers cg ON cg.Id = c.AssignedCaregiverId
				WHERE {where_clause}
				ORDER BY c.CreatedAt DESC
				LIMIT 1
				""",
				(param,),
			)

		if not rows:
			answer = "Mình chưa tìm thấy caregiver để tra cứu kinh nghiệm."
			caregiver = None
		else:
			caregiver = rows[0]
			answer = f"{caregiver['FullName']} có {caregiver['ExperienceYears']} năm kinh nghiệm (chuyên môn: {caregiver.get('Specialization') or 'N/A'})."

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"caregiver": caregiver},
			suggestions=["Caregiver có thể chăm sóc bệnh nhân Alzheimer không?", "Tôi có thể đánh giá caregiver như thế nào?"],
		)

	def handle_caregiver_alzheimer(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["family_id", "patient_id", "caregiver_id"])
		if missing:
			return missing

		if req.caregiver_id:
			rows = self.db.query(
				"SELECT Id, FullName, Specialization, Bio FROM Caregivers WHERE Id = %s",
				(req.caregiver_id,),
			)
		else:
			where_clause = "c.FamilyId = %s" if req.family_id else "c.PatientId = %s"
			param = req.family_id if req.family_id else req.patient_id
			rows = self.db.query(
				f"""
				SELECT cg.Id, cg.FullName, cg.Specialization, cg.Bio
				FROM Contracts c
				JOIN Caregivers cg ON cg.Id = c.AssignedCaregiverId
				WHERE {where_clause}
				ORDER BY c.CreatedAt DESC
				LIMIT 1
				""",
				(param,),
			)

		if not rows:
			return ChatResponse(
				category=route.category,
				intent=route.intent,
				answer="Mình chưa tìm thấy thông tin caregiver để kiểm tra chuyên môn Alzheimer.",
			)

		cg = rows[0]
		profile = f"{(cg.get('Specialization') or '')} {(cg.get('Bio') or '')}".lower()
		supported = any(token in profile for token in ["alzheimer", "dementia", "mat tri nho", "sa sut tri tue"])

		if supported:
			answer = f"{cg['FullName']} có thông tin chuyên môn liên quan Alzheimer/sa sút trí tuệ trong hồ sơ."
		else:
			answer = (
				f"Chưa thấy từ khóa Alzheimer rõ ràng trong hồ sơ của {cg['FullName']}. "
				"Bạn có thể yêu cầu admin gán caregiver có chuyên môn phù hợp hơn."
			)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"caregiver": cg, "supports_alzheimer": supported},
			suggestions=["Làm sao để thay đổi caregiver?", "Caregiver có kinh nghiệm bao nhiêu năm?"],
		)

	def handle_caregiver_rating(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		if req.caregiver_id is None:
			missing = self._require_any_id(req, route, ["family_id", "patient_id", "caregiver_id"])
			if missing:
				return missing

			where_clause = "c.FamilyId = %s" if req.family_id else "c.PatientId = %s"
			param = req.family_id if req.family_id else req.patient_id
			find_cg = self.db.query(
				f"""
				SELECT c.AssignedCaregiverId
				FROM Contracts c
				WHERE {where_clause}
				ORDER BY c.CreatedAt DESC
				LIMIT 1
				""",
				(param,),
			)
			if not find_cg or not find_cg[0].get("AssignedCaregiverId"):
				return ChatResponse(
					category=route.category,
					intent=route.intent,
					answer="Mình chưa xác định được caregiver để lấy rating.",
				)
			caregiver_id = int(find_cg[0]["AssignedCaregiverId"])
		else:
			caregiver_id = req.caregiver_id

		stats = self.db.query(
			"""
			SELECT COUNT(*) AS TotalReviews, AVG(Rating) AS AvgRating
			FROM Feedbacks
			WHERE CaregiverId = %s
			""",
			(caregiver_id,),
		)
		detail = self.db.query(
			"SELECT FullName FROM Caregivers WHERE Id = %s LIMIT 1",
			(caregiver_id,),
		)
		name = detail[0]["FullName"] if detail else f"Caregiver #{caregiver_id}"
		total = int(stats[0]["TotalReviews"]) if stats else 0
		avg = float(stats[0]["AvgRating"]) if stats and stats[0]["AvgRating"] is not None else None

		if total == 0:
			answer = f"{name} chưa có đánh giá nào. Bạn có thể gửi feedback sau mỗi ca chăm sóc."
		else:
			answer = f"{name} đang có {total} đánh giá, điểm trung bình {avg:.2f}/5."

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"caregiver_id": caregiver_id, "caregiver_name": name, "total_reviews": total, "average_rating": avg},
			suggestions=["Tôi có thể đánh giá caregiver như thế nào?", "Caregiver của tôi là ai?"],
		)

	def handle_forgot_password(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=(
				"Nếu quên mật khẩu, bạn dùng chức năng Quên mật khẩu trên màn hình đăng nhập. "
				"Hệ thống backend có endpoint /api/auth/forgot-password để gửi link reset và /api/auth/reset-password để đặt lại mật khẩu."
			),
			suggestions=["Làm thế nào để cập nhật thông tin bệnh nhân?", "Tôi có thể xem lịch sử thanh toán ở đâu?"],
		)

	def handle_update_patient_info(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		if req.patient_id:
			rows = self.db.query(
				"SELECT Id, FullName, CurrentCondition, Allergies, UpdatedAt FROM Patients WHERE Id = %s LIMIT 1",
				(req.patient_id,),
			)
		else:
			rows = []

		if rows:
			p = rows[0]
			answer = (
				f"Bạn có thể cập nhật hồ sơ bệnh nhân {p['FullName']} trong mục Patient Profile. "
				"Nên cập nhật các trường: tình trạng hiện tại, dị ứng, liên hệ khẩn cấp, địa chỉ chăm sóc."
			)
		else:
			answer = (
				"Bạn vào mục Patient Profile để cập nhật thông tin bệnh nhân: tình trạng hiện tại, dị ứng, số liên hệ khẩn cấp, "
				"địa chỉ và ghi chú y tế."
			)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"patient": rows[0] if rows else None},
			suggestions=["Tôi quên mật khẩu thì phải làm sao?", "Tôi có thể xem lịch sử thanh toán ở đâu?"],
		)

	def handle_payment_history(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["family_id"])
		if missing:
			return missing

		rows = self.db.query(
			"""
			SELECT Id, Amount, Status, Method, CreatedAt, PaidAt, Description
			FROM Payments
			WHERE FamilyId = %s
			ORDER BY CreatedAt DESC
			LIMIT 5
			""",
			(req.family_id,),
		)

		if not rows:
			answer = "Bạn chưa có lịch sử thanh toán nào trong hệ thống."
		else:
			lines = [
				f"- Payment #{p['Id']}: {self._fmt_currency(p['Amount'])}, {p['Status']}, phương thức {p['Method']}, tạo lúc {p['CreatedAt']}"
				for p in rows
			]
			answer = "Lịch sử thanh toán gần nhất:\n" + "\n".join(lines)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"payments": rows},
			suggestions=["Chi phí dịch vụ chăm sóc là bao nhiêu?", "Làm thế nào để tạo yêu cầu chăm sóc?"],
		)

	def handle_fall_response(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		answer = (
			"Nếu bệnh nhân bị ngã:\n"
			"1) Giữ bình tĩnh, kiểm tra ý thức/hô hấp/chảy máu.\n"
			"2) Không tự ý di chuyển bệnh nhân nếu nghi chấn thương đầu/cột sống.\n"
			"3) Gọi caregiver hoặc người thân gần nhất ngay lập tức.\n"
			"4) Gọi cấp cứu 115 nếu có dấu hiệu nguy hiểm (bất tỉnh, đau ngực, khó thở, chảy máu nhiều).\n"
			"5) Ghi nhận incident trên hệ thống sau khi ổn định tình huống."
		)
		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			suggestions=["Làm thế nào để liên hệ caregiver ngay lập tức?", "Có incident nào xảy ra không?"],
		)

	def handle_contact_caregiver_now(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		missing = self._require_any_id(req, route, ["family_id", "patient_id"])
		if missing:
			return missing

		where_clause = "c.FamilyId = %s" if req.family_id else "c.PatientId = %s"
		param = req.family_id if req.family_id else req.patient_id

		rows = self.db.query(
			f"""
			SELECT cg.FullName, u.Phone, u.Email
			FROM Contracts c
			JOIN Caregivers cg ON cg.Id = c.AssignedCaregiverId
			JOIN Users u ON u.Id = cg.UserId
			WHERE {where_clause}
			ORDER BY c.CreatedAt DESC
			LIMIT 1
			""",
			(param,),
		)

		if not rows:
			answer = "Mình chưa tìm thấy caregiver đang phụ trách để liên hệ ngay."
			data = None
		else:
			cg = rows[0]
			answer = f"Liên hệ caregiver ngay: {cg['FullName']} | SĐT: {cg.get('Phone') or 'N/A'} | Email: {cg.get('Email') or 'N/A'}."
			data = cg

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data={"caregiver_contact": data},
			suggestions=["Nếu bệnh nhân bị ngã thì phải làm gì?", "Tôi có thể gọi hỗ trợ khẩn cấp từ hệ thống không?"],
		)

	def handle_system_emergency_support(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		if req.patient_id:
			patient_rows = self.db.query(
				"SELECT FullName, EmergencyContact, EmergencyPhone FROM Patients WHERE Id = %s LIMIT 1",
				(req.patient_id,),
			)
		else:
			patient_rows = []

		if req.family_id:
			family_rows = self.db.query(
				"SELECT FullName, EmergencyContact FROM Families WHERE Id = %s LIMIT 1",
				(req.family_id,),
			)
		else:
			family_rows = []

		answer = (
			"Trong tình huống khẩn cấp, ưu tiên gọi 115. Đồng thời liên hệ caregiver đang phụ trách và người liên hệ khẩn cấp trong hồ sơ."
		)

		data: Dict[str, Any] = {}
		if patient_rows:
			data["patient_emergency"] = patient_rows[0]
			answer += (
				f"\nBệnh nhân: {patient_rows[0].get('FullName')} | "
				f"Emergency contact: {patient_rows[0].get('EmergencyContact') or 'N/A'} | "
				f"Phone: {patient_rows[0].get('EmergencyPhone') or 'N/A'}."
			)
		if family_rows:
			data["family_emergency"] = family_rows[0]
			answer += (
				f"\nGia đình: {family_rows[0].get('FullName')} | "
				f"Emergency contact: {family_rows[0].get('EmergencyContact') or 'N/A'}."
			)

		return ChatResponse(
			category=route.category,
			intent=route.intent,
			answer=answer,
			data=data,
			suggestions=["Làm thế nào để liên hệ caregiver ngay lập tức?", "Nếu bệnh nhân bị ngã thì phải làm gì?"],
		)

	def handle_general_consultation(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		services = self._safe_query(
			"""
			SELECT Name, Category, PricePerHour
			FROM Services
			WHERE IsActive = 1
			ORDER BY PricePerHour ASC
			LIMIT 5
			"""
		)

		latest_schedule = []
		latest_payment = []
		latest_health = []

		if req.family_id and req.family_id > 0:
			latest_schedule = self._safe_query(
				"""
				SELECT s.ScheduleDate, s.StartTime, s.EndTime, s.Status
				FROM Schedules s
				JOIN Contracts c ON c.Id = s.ContractId
				WHERE c.FamilyId = %s
				ORDER BY s.ScheduleDate DESC, s.StartTime DESC
				LIMIT 1
				""",
				(req.family_id,),
			)
			latest_payment = self._safe_query(
				"""
				SELECT Amount, Status, CreatedAt
				FROM Payments
				WHERE FamilyId = %s
				ORDER BY CreatedAt DESC
				LIMIT 1
				""",
				(req.family_id,),
			)

		if req.patient_id and req.patient_id > 0:
			latest_health = self._safe_query(
				"""
				SELECT ReportDate, ReportType, Status, HealthScore
				FROM HealthReports
				WHERE PatientId = %s
				ORDER BY ReportDate DESC
				LIMIT 1
				""",
				(req.patient_id,),
			)

		parts: List[str] = [
			"Em là chuyên viên tư vấn HomeCare. Dựa trên dữ liệu hệ thống hiện tại, em tư vấn nhanh cho anh/chị như sau:",
		]

		if services:
			service_lines = [
				f"- {s['Name']} ({s['Category']}): {self._fmt_currency(s['PricePerHour'])}/giờ"
				for s in services
			]
			parts.append("Các gói dịch vụ nổi bật hiện có:\n" + "\n".join(service_lines))

		if latest_schedule:
			s = latest_schedule[0]
			parts.append(
				f"Lịch chăm sóc gần nhất của gia đình: {s.get('ScheduleDate')} {s.get('StartTime')}-{s.get('EndTime')} (trạng thái {s.get('Status')})."
			)

		if latest_payment:
			p = latest_payment[0]
			parts.append(
				f"Thanh toán gần nhất: {self._fmt_currency(p.get('Amount'))}, trạng thái {p.get('Status')}, thời điểm {p.get('CreatedAt')}."
			)

		if latest_health:
			h = latest_health[0]
			parts.append(
				f"Báo cáo sức khỏe mới nhất: {h.get('ReportType')} ngày {h.get('ReportDate')}, trạng thái {h.get('Status')}, điểm {h.get('HealthScore')}."
			)

		if len(parts) == 1:
			parts.append(
				"Hiện em chưa đủ dữ liệu định danh để tư vấn sâu theo hồ sơ cụ thể. Anh/chị có thể gửi thêm family_id hoặc patient_id để em tư vấn sát hơn."
			)

		answer = "\n\n".join(parts)
		return ChatResponse(
			category="general",
			intent="general_consultation",
			answer=answer,
			data={
				"services": services,
				"latest_schedule": latest_schedule[0] if latest_schedule else None,
				"latest_payment": latest_payment[0] if latest_payment else None,
				"latest_health": latest_health[0] if latest_health else None,
			},
			suggestions=[
				"Bên mình có những dịch vụ gì?",
				"Hôm nay có lịch chăm sóc không?",
				"Chi phí dịch vụ gói tháng là bao nhiêu?",
				"Kiểm tra tình trạng sức khỏe gần nhất của bệnh nhân",
			],
		)

	def handle_fallback(self, req: ChatRequest, route: IntentRoute) -> ChatResponse:
		examples = [
			"Làm thế nào để tạo yêu cầu chăm sóc cho người thân?",
			"Chi phí dịch vụ chăm sóc là bao nhiêu?",
			"Hôm nay caregiver có lịch chăm sóc không?",
			"Hôm nay tình trạng sức khỏe của bệnh nhân như thế nào?",
			"Tôi quên mật khẩu thì phải làm sao?",
			"Nếu bệnh nhân bị ngã thì phải làm gì?",
		]
		return ChatResponse(
			category="general",
			intent="fallback",
			answer=(
				"Em là chuyên viên tư vấn HomeCare và sẵn sàng hỗ trợ anh/chị. "
				"Hiện em chưa xác định đúng nhu cầu từ câu hỏi vừa rồi. "
				"Anh/chị cho em biết rõ hơn anh/chị muốn xem lịch, chi phí, caregiver hay tình trạng sức khỏe để em tư vấn đúng ngay."
			),
			suggestions=examples,
		)


def create_app() -> FastAPI:
	app = FastAPI(title="HomeCare RAG Chatbot API", version="1.0.0")

	try:
		db_client = DatabaseClient()
		chatbot = HomeCareChatbot(db_client)
		app.state.chatbot = chatbot
	except Exception as ex:
		app.state.chatbot_error = str(ex)

	try:
		app.state.llm_client = LLMClient()
	except Exception as ex:
		app.state.llm_error = str(ex)

	@app.get("/health")
	def health() -> Dict[str, Any]:
		if hasattr(app.state, "chatbot_error"):
			return {"ok": False, "error": app.state.chatbot_error}
		if hasattr(app.state, "llm_error"):
			return {"ok": True, "message": "chatbot is ready", "llm": "disabled", "llm_error": app.state.llm_error}
		return {"ok": True, "message": "chatbot is ready", "llm": "enabled"}

	@app.post("/chat", response_model=ChatResponse)
	def chat(req: ChatRequest) -> ChatResponse:
		if hasattr(app.state, "chatbot_error"):
			raise HTTPException(status_code=500, detail=app.state.chatbot_error)
		response = app.state.chatbot.answer(req)

		# LLM rewrites the final wording while preserving DB-grounded content.
		if hasattr(app.state, "llm_client"):
			response.answer = app.state.llm_client.rewrite_answer(req.question, response)

		return response

	return app


app = create_app()


if __name__ == "__main__":
	import uvicorn

	port = int(os.getenv("RAG_API_PORT", "8001"))
	uvicorn.run("rag_api:app", host="0.0.0.0", port=port, reload=True)
