import { useState, useEffect } from "react";
import { ArrowLeft, FileText, PlusCircle, Mail, Phone, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { paymentApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const getStatusBadge = (status) => {
  const statusMapNum = { 0: 'pending', 1: 'success', 2: 'failed', 3: 'refunded' };
  const normalized =
    typeof status === 'number'
      ? statusMapNum[status] || 'unknown'
      : String(status || '').toLowerCase();
  switch (normalized) {
    case 'success':
    case 'paid':
      return 'bg-green-100 text-green-700';
    case 'pending':
    case 'processing':
      return 'bg-yellow-100 text-yellow-700';
    case 'failed':
    case 'error':
      return 'bg-red-100 text-red-700';
    case 'refunded':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const Payments = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const normalizeList = (resp) => {
    if (Array.isArray(resp)) return resp;
    if (!resp) return [];
    if (typeof resp === 'string') {
      try {
        const parsed = JSON.parse(resp);
        return normalizeList(parsed);
      } catch {
        return [];
      }
    }
    if (typeof resp !== 'object') return [];
    const commonKeys = ['items', 'data', 'results', 'list', 'content'];
    for (const k of commonKeys) {
      const v = resp[k];
      if (Array.isArray(v)) return v;
    }
    const firstArray = Object.values(resp).find(Array.isArray);
    return Array.isArray(firstArray) ? firstArray : [];
  };

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await paymentApi.getById(id);
          setInvoice(data);
          setNoteText(data?.description || '');
        } else {
          const statusParam = statusFilter && statusFilter !== 'All' ? statusFilter : null;
          const listResp = await paymentApi.getAll(statusParam);
          const normalized = normalizeList(listResp);
          setPayments(normalized);
          if (!Array.isArray(listResp) && normalized.length === 0) {
            setError('Unexpected payments response format');
          }
        }
      } catch (error) {
        console.error("Failed to fetch payment:", error);
        setError(error?.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id, statusFilter]);

  const saveNote = async () => {
    if (!invoice?.id) return;
    try {
      setSavingNote(true);
      const updated = await paymentApi.addNote(increasePrecisionId(invoice.id), noteText || '');
      setInvoice(updated);
      setEditingNote(false);
    } catch (e) {
      console.error('Failed to save note', e);
      setError(e?.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const increasePrecisionId = (val) => {
    // guard for accidental string IDs from URL params
    const n = typeof val === 'string' ? parseInt(val, 10) : val;
    return Number.isNaN(n) ? val : n;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (id) {
    if (!invoice) {
      return (
        <div className="p-6">
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Payment not found</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Back Link */}
        <Link
          to="/admin/payments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Link>

        {/* Invoice Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">INVOICE #{invoice.id}</h1>
              <Badge className={getStatusBadge(invoice.status)}>• {invoice.status}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="text-primary font-medium">📱 {invoice.paymentMethod || 'ONLINE PAYMENT'}</span>
              <span>📅 Issued: {formatDate(invoice.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button className="gap-2" onClick={() => setEditingNote(true)}>
              <PlusCircle className="w-4 h-4" />
              Add Internal Note
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient & Family Info */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                      CONTRACT INFORMATION
                    </h3>
                    <div className="flex items-start gap-3">
                      <Avatar className="bg-teal-100 text-teal-700">
                        <AvatarFallback>CT</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Contract #{invoice.contractId}</p>
                        <p className="text-sm text-primary">Payment ID: #{invoice.id}</p>
                        <p className="text-sm text-muted-foreground mt-1">Period: {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                      BILLED TO
                    </h3>
                    <div className="flex items-start gap-3">
                      <Avatar className="bg-blue-100 text-blue-700">
                        <AvatarFallback>{invoice.familyName?.[0] || 'F'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{invoice.familyName}</p>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {invoice.familyEmail}</p>
                          <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {invoice.familyPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border last:border-0">
                      <td className="p-3">
                        <p className="font-medium">{invoice.serviceName}</p>
                        <p className="text-sm text-muted-foreground">Care services for period: {formatDate(invoice.periodStart)} to {formatDate(invoice.periodEnd)}</p>
                      </td>
                      <td className="p-3 text-right font-medium">{formatCurrency(invoice.amount)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="p-3 text-right font-semibold">TOTAL AMOUNT</td>
                      <td className="p-3 text-right font-bold text-lg">{formatCurrency(invoice.amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium">Payment successful via {invoice.paymentMethod}</p>
                    <p className="text-sm text-muted-foreground">Transaction ID: {invoice.transactionId || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingNote ? (
                  <>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Nhập ghi chú nội bộ cho payment này..."
                      className="w-full p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => { setEditingNote(false); setNoteText(invoice?.description || ''); }}>
                        Hủy
                      </Button>
                      <Button onClick={saveNote} disabled={savingNote}>
                        {savingNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {invoice?.description?.trim() ? invoice.description : 'Chưa có ghi chú.'}
                    </p>
                    <div className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditingNote(true)}>
                        Thêm/Cập nhật ghi chú
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const filteredPayments = payments.filter((p) => {
    if (!fromDate && !toDate) return true;
    const created = p.createdAt ? new Date(p.createdAt) : null;
    if (!created) return false;
    if (fromDate) {
      const from = new Date(fromDate);
      if (created < new Date(from.getFullYear(), from.getMonth(), from.getDate())) return false;
    }
    if (toDate) {
      const to = new Date(toDate);
      const endOfTo = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999);
      if (created > endOfTo) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <span className="text-sm text-muted-foreground">{filteredPayments.length} records</span>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input type="date" className="mt-1 w-44" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input type="date" className="mt-1 w-44" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => { setStatusFilter('All'); setFromDate(''); setToDate(''); }}>
            Clear Filters
          </Button>
        </div>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No payments found</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Payment</th>
                  <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Family</th>
                  <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Method</th>
                  <th className="text-right p-4 text-xs font-medium text-primary uppercase tracking-wider">Amount</th>
                  <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-primary uppercase tracking-wider">Issued</th>
                  <th className="text-right p-4 text-xs font-medium text-primary uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">#{p.id}</p>
                        <p className="text-sm text-muted-foreground">Contract #{p.contractId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{p.familyName || 'Family'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{p.paymentMethod || 'ONLINE PAYMENT'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadge(p.status)}>• {p.status}</Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{formatDate(p.createdAt)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/payments/${p.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Payments;
