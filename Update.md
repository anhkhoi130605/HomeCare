# Update dự án

## Luồng xử lý chính

```
Family tạo request
→ System chạy Matching Engine
→ Trả về danh sách caregiver phù hợp
→ Admin (Operation-level) xác nhận & phân công
→ System kiểm tra conflict lần cuối
→ Tạo schedule
→ Caregiver check-in & chăm sóc
→ Ghi Care Log / Incident
→ Family theo dõi & nhận thông báo
```

---

## Vấn đề & Hướng giải quyết

**Tình trạng:** 1 Admin không thể xử lý chuyên môn y tế + duyệt tất cả request thủ công.

→ Không thêm role mới, mà **tách vai trò theo chức năng** (functional responsibility) thay vì theo role.

### Tách Admin thành 2 loại quyền (Permission-based):

- **SystemAdmin** – Quản trị hệ thống
- **OperationAdmin** – Điều phối chăm sóc _(1 hệ thống có thể có nhiều OperationAdmin)_

> Không tạo role mới, chỉ thêm permission level – Cơ chế xác định mức độ quyền hạn của tài khoản

---

## Admin dựa vào gì để phân lịch?

→ **Rule Engine + Matching Logic**

- **Rule Engine** (Bộ máy luật): Hệ thống dùng để định nghĩa, quản lý và thực thi các luật (rules) tự động dựa trên điều kiện. Thay vì viết nhiều `if-else` trong code → đưa các luật vào một "engine" để nó tự kiểm tra và xử lý.
- **Matching Logic**: Thuật toán hoặc cơ chế dùng để so khớp (match) dữ liệu với điều kiện hoặc đối tượng phù hợp.

---

## Không cần upload bệnh án

Hệ thống sẽ ưu tiên **structured input** (dữ liệu có schema rõ ràng, máy tính đọc và xử lý rất dễ) thay vì file upload để tối ưu tự động matching.

---

## Luồng Create New Care Request

Phần **Create New Care Request** không nên để family tự chọn giờ → Luồng logic chuẩn sẽ là:

| Bước                 | Nội dung                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Family chọn          | Basic Care                                                                                                                                 |
| System xác định      | Required Skill Level = 1                                                                                                                   |
| Matching Engine chạy | Lọc caregiver có `skill_level ≥ 1` → Lọc caregiver available trong khung giờ → Lọc theo khu vực → Sắp xếp theo rating / workload thấp nhất |
| Kết quả              | → Trả về danh sách phù hợp → Operation Admin chọn 1 người                                                                                  |

### Các điểm cần sửa trong Create Request:

- Dự án đang thiếu **role Family** và **địa chỉ nơi ở của bệnh nhân**
- Thay vì chọn StartTime và EndTime → nên chọn **"gói thời lượng"**: `EndTime = StartTime + Duration`
- Thiếu địa chỉ cho bệnh nhân

### Cách nhập thời lượng:

- Nhập **StartTime** và **thời lượng**
- Thời lượng tùy theo gói Basic hay Premium đã chọn mà hiển thị các option phù hợp
- **Không cần nhập EndTime** vì có thời lượng hệ thống tự tính

**Ví dụ:** Nếu chọn Basic Care → Hệ thống KHÔNG nên cho chọn 12h hay 24h.

```
Duration (for Basic Care):
  - 2 hours
  - 4 hours
```

---

## ⚠️ Quan trọng: Matching ≠ Auto Assign

**Semi-Auto:** Hệ thống tự động một phần, nhưng vẫn cần con người can thiệp ở một số bước.

- System **đề xuất** danh sách
- Operation Admin **quyết định**

---

## Địa chỉ bệnh nhân nên đặt ở đâu?

**CÁCH ĐÚNG NHẤT: Đặt trong Hồ sơ Patient**

```
Dashboard
→ Patients
→ Mỗi bệnh nhân có:
    - Full Name
    - Date of Birth
    - Medical Info
    - Care Address (rất quan trọng)
    - Emergency Contact
```

### Update Add Patient bao gồm:

**Add Patient:**

- Full Name
- DOB
- Gender
- Primary Address _(Required)_
- Contact Person
- Medical Summary

### Trong Create Request hiển thị:

```
Care Location:
📍 123 Nguyễn Trãi, Q1
[ Change ]
```

> Nếu bấm **Change** → nhập temporary address.

---

## Vai trò các bên trong hệ thống

### 🟢 1. FAMILY

**Vai trò:** Tạo yêu cầu chăm sóc

Family làm gì?

- Chọn Patient
- Chọn Service Package (Basic / Premium / Specialized)
- Chọn: Start Date, Start Time, Duration (theo gói)
- Submit Request

> 👉 Family **KHÔNG** chọn điều dưỡng  
> 👉 Family **KHÔNG** tự phân công

---

### 🔵 2. SYSTEM (Matching Logic chạy ngầm)

Sau khi Family submit, System tự động:

- Xác định Required Skill Level theo Package
- Lọc Caregiver:
  - Skill phù hợp
  - Available đúng giờ
  - Không trùng lịch
  - Gần địa chỉ bệnh nhân
- Trả về danh sách đề xuất

---

### 🟡 3. OPERATION ADMIN

**Vai trò:** Điều phối & phân công

Operation Admin:

- Nhận Request đã được hệ thống đề xuất danh sách caregiver
- Xem: Skill level, Lịch rảnh, Workload hiện tại
- Chọn 1 caregiver
- Confirm Assignment

> 👉 Là người chịu trách nhiệm cuối cùng về phân công  
> 👉 Có quyền **override** đề xuất của system

---

### 🔴 4. CAREGIVER

Caregiver:

- Nhận thông báo ca được phân
- Xác nhận ca
- Thực hiện chăm sóc
- Ghi Daily Care Log
- Submit báo cáo

---

### 🟣 5. SYSTEM ADMIN (Admin Sys)

**Vai trò:** Quản trị hệ thống, không tham gia điều phối ca

System Admin:

- Tạo / quản lý tài khoản
- Thiết lập role & permission
- Quản lý Service Package
- Thiết lập Skill Level
- Quản lý giá dịch vụ
- Theo dõi toàn hệ thống

> 👉 **Không** trực tiếp phân công caregiver

---

## Phân biệt Request và Contract

| Tiêu chí   | Request            | Contract       |
| ---------- | ------------------ | -------------- |
| Thời gian  | Ngắn hạn           | Dài hạn        |
| Lịch       | 1 lần hoặc rời rạc | Lặp cố định    |
| Ưu tiên    | Bình thường        | Ưu tiên cao    |
| Caregiver  | Gán theo từng ca   | Có thể cố định |
| Thanh toán | Theo session       | Theo chu kỳ    |

- **Request** = Yêu cầu chăm sóc **NGẮN HẠN / TỪNG LẦN** _(vd: bệnh nhân vừa xuất viện cần chăm sóc thêm 2–3 ngày hoặc 1 tuần)_
- **Contract** = Hợp đồng chăm sóc **DÀI HẠN** _(bệnh nhân cần chăm sóc 1 tháng, bệnh nhân mãn tính…)_

**Family có 2 lựa chọn:**

- Book nhanh → **Request**
- Đăng ký chăm sóc dài hạn → **Contract**

---

## Cấu trúc Navigation

### 1. Services (đổi tên từ "Book Service / Marketplace")

**Chức năng:**

- Hiển thị các gói: Basic / Premium / Specialized
- Các dịch vụ lẻ (Foot care, Injection…)
- **KHÔNG** tạo request trực tiếp ở page này
- Chỉ có nút: **Book Now**

### 2. Khi bấm Book Now

→ Chuyển sang form tạo **Request**

Nơi này mới:

- Chọn Patient
- Chọn Date
- Chọn Time
- Chọn Duration
- Thanh toán
- Sau khi submit → tạo Request

### 3. Contracts Page

**Contracts = Đăng ký dài hạn**

Flow riêng:

- Chọn Service
- Chọn thời gian bắt đầu – kết thúc
- Chọn lịch lặp
- Optional: chọn fixed caregiver
- Thanh toán theo chu kỳ
- Approved → **auto generate multiple Requests**

---

## Update Contracts

- Chọn package nào → tự hiển thị caregiver có skill phù hợp
- Start Time – End Time: nên thêm hiển thị **"Daily Duration: 8 hours"** cụ thể

**Công thức tính:**

```
Total hours = Số ngày trong range khớp Preferred Days × số giờ mỗi ngày
Total cost  = total hours × price_per_hour
```

---

## PAYMENTS

### Khi nào thanh toán?

**Thanh toán ngay lúc tạo Request**

**Flow:**

```
Services
→ Book
→ Chọn ngày giờ + duration
→ System tính tiền
→ Thanh toán
→ Tạo Request (status = Paid & Pending Assignment)
```

### Công thức tính tiền

```
Total = price_per_hour × duration
```

**Ví dụ:**

- Basic: 150.000 / hour
- Chọn 4h
- → **600.000**

---

### Status hệ thống

**Request:**

- `Draft`
- `Awaiting Payment`
- `Paid`
- `Assigned`
- `Completed`
- `Cancelled`
- `Refunded` _(nếu có)_

**Payment:**

- `Pending`
- `Success`
- `Failed`
- `Refunded`

---

### Thanh toán cho CONTRACT (dài hạn)

Khác hoàn toàn Request. Có 2 cách:

#### 🔵 Cách 1 – Đơn giản (dễ làm đồ án)

**Thanh toán toàn bộ upfront**

Ví dụ:

- 1 tháng
- Mon–Fri 8h/ngày
- Tổng tiền = 20 ngày × 8h × giá
- Family thanh toán 1 lần → Contract active

✅ Dễ implement

#### 🔵 Cách 2 – Thực tế hơn

**Thanh toán theo chu kỳ:** Weekly / Monthly

Ví dụ:

- Contract 3 tháng
- Thanh toán mỗi tháng 1 lần

**Status Contract:**

- `Pending Payment`
- `Active`
- `Suspended`
- `Expired`
- `Cancelled`
