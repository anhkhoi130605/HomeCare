import { useState, useEffect } from "react";
import { ArrowLeft, FileText, PlusCircle, Mail, Phone, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { paymentApi } from "@/lib/api";

const Payments = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

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
        } else {
          const list = await paymentApi.getAll();
          setPayments(normalizeList(list));
          if (!Array.isArray(list) && normalizeList(list).length === 0) {
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
  }, [id]);

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

  if (!id && !invoice) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Payments</h1>
          <span className="text-sm text-muted-foreground">{payments.length} records</span>
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
                  {payments.map((p) => (
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
                        <Button size="sm" variant="outline" onClick={() => setInvoice(p)}>
                          View
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
  }

  if (id && !invoice && !loading) {
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
          <Button className="gap-2">
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
                    FAMILY INFORMATION
                  </h3>
                  <div>
                    <p className="font-semibold">{invoice.familyName || 'Family Account'}</p>
                    <p className="text-sm text-muted-foreground">Family ID: {invoice.familyId}</p>
                    {invoice.familyEmail && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <Mail className="w-4 h-4" />
                        {invoice.familyEmail}
                      </div>
                    )}
                    {invoice.familyPhone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="w-4 h-4" />
                        {invoice.familyPhone}
                      </div>
                    )}
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
                    <th className="text-left py-3 text-xs font-medium text-primary uppercase">Description</th>
                    <th className="text-right py-3 text-xs font-medium text-primary uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-4">
                      <p className="font-medium">Care Service Payment</p>
                      <p className="text-sm text-muted-foreground">Period: {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}</p>
                    </td>
                    <td className="py-4 text-right font-medium">{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-b border-border">
                    <td className="py-3 text-primary">Subtotal</td>
                    <td className="py-3 text-right">{formatCurrency(invoice.amount)}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 text-primary">Tax (0%)</td>
                    <td className="py-3 text-right">{formatCurrency(0)}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-lg">TOTAL AMOUNT</td>
                    <td className="py-4 text-right font-bold text-2xl text-primary">{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Origin */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase text-muted-foreground">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${invoice.status === 'Success' ? 'bg-green-100' : invoice.status === 'Failed' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                  <CheckCircle className={`w-5 h-5 ${invoice.status === 'Success' ? 'text-green-600' : invoice.status === 'Failed' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                </div>
                <div>
                  <p className="font-semibold">{invoice.status}</p>
                  <p className="text-xs text-muted-foreground">Due: {formatDate(invoice.dueDate)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground uppercase text-xs">Method</p>
                  <p className="font-medium">{invoice.paymentMethod || 'Bank Transfer'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase text-xs">Paid Date</p>
                  <p className="font-medium">{invoice.paidAt ? formatDate(invoice.paidAt) : 'Pending'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm uppercase text-muted-foreground">Notes</CardTitle>
              <Button variant="link" className="text-primary p-0 h-auto">Add New</Button>
            </CardHeader>
            <CardContent>
              {invoice.notes ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payments;
