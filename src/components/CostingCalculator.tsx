import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { getCostingSheets } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Plus, Trash2, Loader2, AlertCircle, Save } from 'lucide-react';
import { GET_COSTING_SHEETS, SAVE_COSTING_SHEET, DELETE_COSTING_SHEET } from '@/queries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Interfaces matching the GraphQL schema
interface MaterialCost {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  currency: string;
  total: number;
  __typename?: string;
}

interface LaborCost {
  id: string;
  operation: string;
  timeMinutes: number;
  ratePerHour: number;
  currency: string;
  total: number;
  __typename?: string;
}

interface OverheadCost {
  id: string;
  category: string;
  amount: number;
  currency: string;
  type: 'FIXED' | 'PERCENTAGE';
  __typename?: string;
}

interface CostBreakdown {
  materials: MaterialCost[];
  labor: LaborCost[];
  overheads: OverheadCost[];
  __typename?: string;
}

interface TaxConfiguration {
  vatRate: number;
  customsDuty: number;
  otherTaxes: number;
  __typename?: string;
}

interface CostingSheet {
    id: string;
    name: string;
    costBreakdown: CostBreakdown;
    taxConfig: TaxConfiguration;
    profitMargin: number;
    selectedCurrency: string;
    __typename?: string;
    createdAt?: string;
    updatedAt?: string;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 24 }}>
        <h2>Something went wrong in Costing Calculator.</h2>
        <pre>{this.state.error && this.state.error.toString()}</pre>
      </div>;
    }
    return this.props.children;
  }
}

// Helper to recalculate totals for all items
function recalculateTotals(sheet: CostingSheet): CostingSheet {
  const newSheet = JSON.parse(JSON.stringify(sheet));
  if (newSheet.costBreakdown.materials) {
    newSheet.costBreakdown.materials = newSheet.costBreakdown.materials.map((m: any) => ({
      ...m,
      total: m.quantity * m.unitCost
    }));
  }
  if (newSheet.costBreakdown.labor) {
    newSheet.costBreakdown.labor = newSheet.costBreakdown.labor.map((l: any) => ({
      ...l,
      total: (l.timeMinutes / 60) * l.ratePerHour
    }));
  }
  return newSheet;
}

const CostingCalculator: React.FC = () => {
  const [costingSheets, setCostingSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchCostingSheets = () => {
    setLoading(true);
    getCostingSheets()
      .then((sheets) => {
        // No need to parse costBreakdown and taxConfig, they are already objects
        setCostingSheets(sheets);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    refetchCostingSheets();
  }, []);

  const [saveCostingSheet, { loading: isSaving }] = useMutation(SAVE_COSTING_SHEET, {
    refetchQueries: [{ query: GET_COSTING_SHEETS }],
    onError: (err) => {
      alert(`Failed to save sheet: ${err.message}`);
    }
  });
  const [deleteCostingSheet] = useMutation(DELETE_COSTING_SHEET, {
    refetchQueries: [{ query: GET_COSTING_SHEETS }],
  });

  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [localSheetData, setLocalSheetData] = useState<CostingSheet | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (costingSheets && costingSheets.length > 0) {
      // Only set activeSheetId if it's null and there are sheets available
      if (activeSheetId === null) {
        setActiveSheetId(costingSheets[costingSheets.length - 1].id); // Select the most recently added sheet
      }
    } else if (costingSheets?.length === 0) {
      setActiveSheetId(null);
      setLocalSheetData(null);
    }
  }, [costingSheets, activeSheetId]);

  useEffect(() => {
    if (activeSheetId && costingSheets) {
      const sheet = costingSheets.find(s => s.id === activeSheetId);
      setLocalSheetData(sheet ? recalculateTotals(sheet) : null);
    }
  }, [activeSheetId, costingSheets]);

  useEffect(() => {
    console.log('DEBUG: localSheetData', localSheetData);
    console.log('DEBUG: costingSheets', costingSheets);
  }, [localSheetData, costingSheets]);

  useEffect(() => {
    if (costingSheets) {
      console.log("DEBUG: costingSheets from backend", costingSheets);
    }
  }, [costingSheets]);

  // Ensure activeSheetId is always valid after data changes (e.g., after delete)
  useEffect(() => {
    if (!costingSheets) return;
    if (activeSheetId && !costingSheets.find(s => s.id === activeSheetId)) {
      // If the current activeSheetId is no longer present, select the first available or null
      if (costingSheets.length > 0) {
        setActiveSheetId(costingSheets[0].id);
      } else {
        setActiveSheetId(null);
        setLocalSheetData(null);
      }
    }
  }, [costingSheets]);

  const handleSave = async () => {
    if (!localSheetData) return;
    const { id, __typename, costBreakdown, taxConfig, createdAt, updatedAt, ...rest } = localSheetData;
    const input = {
      ...rest,
      costBreakdown: {
        materials: costBreakdown.materials.map(({ id: _id, __typename: _t, total: _total, ...m }) => m),
        labor: costBreakdown.labor.map(({ id: _id, __typename: _t, total: _total, ...l }) => l),
        overheads: costBreakdown.overheads.map(({ id: _id, __typename: _t, ...o }) => o),
      },
      taxConfig: {
        vatRate: Number(taxConfig.vatRate),
        customsDuty: Number(taxConfig.customsDuty),
        otherTaxes: Number(taxConfig.otherTaxes),
      },
    };
    const allowed = ['name', 'costBreakdown', 'taxConfig', 'profitMargin', 'selectedCurrency'];
    const cleanInput: any = {};
    for (const key of allowed) {
      if (input[key] !== undefined) cleanInput[key] = input[key];
    }
    let res;
    if (id) {
      res = await saveCostingSheet({ variables: { id, input: cleanInput } });
    } else {
      res = await saveCostingSheet({ variables: { input: cleanInput } });
    }
    if (res && res.data && res.data.saveCostingSheet) {
      setActiveSheetId(res.data.saveCostingSheet.id);
      setLocalSheetData(recalculateTotals(res.data.saveCostingSheet));
    }
  };

  const handleFieldChange = (path: string, value: any) => {
    setLocalSheetData(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev));
        const keys = path.split('.');
        let current: any = newState;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newState;
    });
  };

  const handleListItemChange = (listName: 'materials' | 'labor' | 'overheads', index: number, field: string, value: any) => {
    setLocalSheetData(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev));
        const item = newState.costBreakdown[listName][index];
        item[field] = value;
        // Always recalculate total for materials and labor
        if (listName === 'materials') {
            item.total = item.quantity * item.unitCost;
        }
        if (listName === 'labor') {
            item.total = (item.timeMinutes / 60) * item.ratePerHour;
        }
        
        return newState;
    });
  };

  const addListItem = (listName: 'materials' | 'labor' | 'overheads') => {
    setLocalSheetData(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev));
        const selectedCurrency = newState.selectedCurrency;
        let newItem;
        if (listName === 'materials') {
            newItem = { id: Date.now().toString(), name: '', quantity: 0, unit: 'pieces', unitCost: 0, currency: selectedCurrency, total: 0 };
        } else if (listName === 'labor') {
            newItem = { id: Date.now().toString(), operation: '', timeMinutes: 0, ratePerHour: 0, currency: selectedCurrency, total: 0 };
        } else {
            newItem = { id: Date.now().toString(), category: '', amount: 0, currency: selectedCurrency, type: 'FIXED' };
        }
        newState.costBreakdown[listName].push(newItem);
        return newState;
    });
  };

  const removeListItem = (listName: 'materials' | 'labor' | 'overheads', id: string) => {
    setLocalSheetData(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev));
        newState.costBreakdown[listName] = newState.costBreakdown[listName].filter(item => item.id !== id);
        return newState;
    });
  };
  
  const createNewSheet = async () => {
    const newSheet = {
      name: 'New Costing Sheet',
      costBreakdown: { materials: [], labor: [], overheads: [] },
      taxConfig: { vatRate: 0, customsDuty: 0, otherTaxes: 0 },
      profitMargin: 0,
      selectedCurrency: 'USD',
    };
    console.log('[DEBUG] createNewSheet called with:', newSheet);
    try {
      const res = await saveCostingSheet({ variables: { input: newSheet } });
      console.log('[DEBUG] saveCostingSheet response:', res);
      if (res && res.data && res.data.saveCostingSheet) {
        setActiveSheetId(res.data.saveCostingSheet.id);
        setLocalSheetData(recalculateTotals(res.data.saveCostingSheet));
        await refetchCostingSheets(); // Force refetch after creation
      }
    } catch (err) {
      console.error('[DEBUG] saveCostingSheet error:', err);
    }
  };
  
  const handleDeleteSheet = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      console.log("About to call fetch for delete...");
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "mutation DeleteCostingSheet($id: ID!) { deleteCostingSheet(id: $id) { id } }",
          variables: { id: confirmDeleteId }
        })
      });
      console.log("Fetch sent, awaiting response...");
      const result = await response.json();
      console.log("Manual fetch result:", result);
      if (result.errors) {
        alert("Delete error: " + result.errors.map((e: any) => e.message).join(", "));
      } else {
        await refetchCostingSheets();
      }
      setConfirmDeleteId(null);
    } catch (err) {
      alert("Delete error: " + (err instanceof Error ? err.message : String(err)));
      console.error("Delete mutation error:", err);
      setConfirmDeleteId(null);
    }
  };

  const calculateTotalMaterialCost = () => localSheetData?.costBreakdown.materials.reduce((sum, m) => sum + m.total, 0) || 0;
  const calculateTotalLaborCost = () => localSheetData?.costBreakdown.labor.reduce((sum, l) => sum + l.total, 0) || 0;
  const calculateTotalOverheadCost = () => {
    if (!localSheetData) return 0;
    const baseCost = calculateTotalMaterialCost() + calculateTotalLaborCost();
    return localSheetData.costBreakdown.overheads.reduce((sum, o) => sum + (o.type === 'PERCENTAGE' ? (baseCost * o.amount) / 100 : o.amount), 0);
  };
  const calculateSubtotal = () => calculateTotalMaterialCost() + calculateTotalLaborCost() + calculateTotalOverheadCost();
  const calculateTaxes = () => {
      if (!localSheetData) return 0;
      const { vatRate, customsDuty, otherTaxes } = localSheetData.taxConfig;
      return (calculateSubtotal() * (vatRate / 100)) + (calculateSubtotal() * (customsDuty / 100)) + (calculateSubtotal() * (otherTaxes / 100));
  };
  const calculateTotalCost = () => calculateSubtotal() + calculateTaxes();
  const calculateSellingPrice = () => localSheetData ? calculateTotalCost() * (1 + localSheetData.profitMargin / 100) : 0;

  const currencySymbol = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CNY: '¥' };

  return (
    <div className="h-full flex flex-col">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Costing Data...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-full text-red-600">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span>Error loading data: {error}</span>
        </div>
      )}
      {!loading && !error && !localSheetData && (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-semibold mb-4">No Costing Sheets Found</h2>
            <p className="text-gray-600 mb-6">Get started by creating your first costing sheet.</p>
            <Button onClick={createNewSheet}><Plus className="h-4 w-4 mr-2" />Create New Costing Sheet</Button>
        </div>
      )}
      {!loading && !error && localSheetData && (
        <div className="flex flex-col flex-grow p-6 space-y-8">
          <div className="grid grid-cols-4 md:grid-cols-10 gap-6 items-center w-full">
            <div className="flex items-center gap-x-2 col-span-6 md:col-span-12">
                <Calculator className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Costing Calculator</h1>
            
      <div className="flex items-center justify-between w-full gap-6">
                 {/* Left group: Select */}
         <Select value={activeSheetId || ''} onValueChange={id => { setActiveSheetId(id); }}>
        <SelectTrigger className="w-[570px] gap-2">
          <SelectValue placeholder="Select a sheet..." />
        </SelectTrigger>
        <SelectContent>
          {costingSheets.map(sheet => (
            <SelectItem key={sheet.id} value={sheet.id}>{sheet.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

                 {/* Right group: Buttons */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? <Loader2 className="h-4 w-4 mr-10 animate-spin" />
              : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>

        <Button onClick={createNewSheet}>
        <Plus className="h-4 w-4 mr-2 gap-x-8" /> New
        </Button>

        <Button variant="destructive" size="icon" onClick={() => handleDeleteSheet(localSheetData.id)}>
          <Trash2 className="flex items-center gap-x-2 col-span-8 md:col-span-10" />
        </Button>
        </div>
      </div>

      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div><Label>Sheet Name</Label><Input value={localSheetData.name} onChange={(e) => handleFieldChange('name', e.target.value)} /></div>
            <div><Label>Base Currency</Label><Select value={localSheetData.selectedCurrency} onValueChange={v => handleFieldChange('selectedCurrency', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(currencySymbol).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Profit Margin (%)</Label><Input type="number" value={localSheetData.profitMargin} onChange={(e) => handleFieldChange('profitMargin', Number(e.target.value))} /></div>
      </div>

      <Tabs defaultValue="materials" className="flex flex-col flex-grow">
      <TabsList className="flex w-full">
         <TabsTrigger className="flex-1 text-center" value="materials">Materials</TabsTrigger>
         <TabsTrigger className="flex-1 text-center" value="labor">Labor</TabsTrigger>
         <TabsTrigger className="flex-1 text-center" value="overheads">Overheads</TabsTrigger>
         <TabsTrigger className="flex-1 text-center" value="taxes">Tax Config</TabsTrigger>
         <TabsTrigger className="flex-1 text-center" value="summary">Cost Summary</TabsTrigger>
      </TabsList>

            <TabsContent value="materials" className="flex-grow p-1">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between"><CardTitle>Material Costs</CardTitle><Button onClick={() => addListItem('materials')}><Plus className="h-4 w-4 mr-2" />Add Material</Button></CardHeader>
                <CardContent className="flex-grow flex flex-col p-0">
                  <div className="flex-grow overflow-y-auto p-4">
                  {localSheetData.costBreakdown.materials.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No materials added. Click "Add Material" to begin.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {localSheetData.costBreakdown.materials.map((material, index) => (
                        <Card key={material.id} className="p-4"><div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-2"><Label>Material Name</Label><Input value={material.name} onChange={(e) => handleListItemChange('materials', index, 'name', e.target.value)} /></div>
                          <div><Label>Quantity</Label><Input type="number" value={material.quantity} onChange={(e) => handleListItemChange('materials', index, 'quantity', Number(e.target.value))} /></div>
                          <div><Label>Unit Cost</Label><Input type="number" step="0.01" value={material.unitCost} onChange={(e) => handleListItemChange('materials', index, 'unitCost', Number(e.target.value))} /></div>
                          <div className="flex-1"><Label>Total</Label><div className="text-lg font-semibold">{currencySymbol[material.currency as keyof typeof currencySymbol]}{(material.total ?? 0).toFixed(2)}</div></div>
                          <div><Button variant="outline" size="icon" onClick={() => removeListItem('materials', material.id)}><Trash2 className="h-4 w-4" /></Button></div>
                        </div></Card>
                      ))}
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="labor" className="flex-grow p-1">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between"><CardTitle>Labor Costs</CardTitle><Button onClick={() => addListItem('labor')}><Plus className="h-4 w-4 mr-2" />Add Labor</Button></CardHeader>
                <CardContent className="flex-grow flex flex-col p-0">
                  <div className="flex-grow overflow-y-auto p-4">
                    {localSheetData.costBreakdown.labor.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No labor costs added. Click "Add Labor" to begin.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {localSheetData.costBreakdown.labor.map((labor, index) => (
                          <Card key={labor.id} className="p-4"><div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div className="md:col-span-2"><Label>Operation</Label><Input value={labor.operation} onChange={(e) => handleListItemChange('labor', index, 'operation', e.target.value)} /></div>
                            <div><Label>Time (min)</Label><Input type="number" value={labor.timeMinutes} onChange={(e) => handleListItemChange('labor', index, 'timeMinutes', Number(e.target.value))} /></div>
                            <div><Label>Rate/Hour</Label><Input type="number" step="0.01" value={labor.ratePerHour} onChange={(e) => handleListItemChange('labor', index, 'ratePerHour', Number(e.target.value))} /></div>
                            <div className="flex-1"><Label>Total</Label><div className="text-lg font-semibold">{currencySymbol[labor.currency as keyof typeof currencySymbol]}{(labor.total ?? 0).toFixed(2)}</div></div>
                            <div><Button variant="outline" size="icon" onClick={() => removeListItem('labor', labor.id)}><Trash2 className="h-4 w-4" /></Button></div>
                          </div></Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overheads" className="flex-grow p-1">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between"><CardTitle>Overhead Costs</CardTitle><Button onClick={() => addListItem('overheads')}><Plus className="h-4 w-4 mr-2" />Add Overhead</Button></CardHeader>
                <CardContent className="flex-grow flex flex-col p-0">
                  <div className="flex-grow overflow-y-auto p-4">
                    {localSheetData.costBreakdown.overheads.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No overhead costs added. Click "Add Overhead" to begin.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {localSheetData.costBreakdown.overheads.map((overhead, index) => (
                          <Card key={overhead.id} className="p-4"><div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div><Label>Category</Label><Input value={overhead.category} onChange={(e) => handleListItemChange('overheads', index, 'category', e.target.value)} /></div>
                            <div><Label>Amount</Label><Input type="number" value={overhead.amount} onChange={(e) => handleListItemChange('overheads', index, 'amount', Number(e.target.value))} /></div>
                            <div><Label>Type</Label><Select value={overhead.type} onValueChange={(v) => handleListItemChange('overheads', index, 'type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FIXED">Fixed</SelectItem><SelectItem value="PERCENTAGE">Percentage</SelectItem></SelectContent></Select></div>
                            <div><Button variant="outline" size="icon" onClick={() => removeListItem('overheads', overhead.id)}><Trash2 className="h-4 w-4" /></Button></div>
                          </div></Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="taxes" className="flex-grow p-1">
                <Card className="h-full"><CardHeader><CardTitle>Tax Configuration</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div><Label>VAT/Sales Tax (%)</Label><Input type="number" value={localSheetData.taxConfig.vatRate} onChange={e => handleFieldChange('taxConfig.vatRate', Number(e.target.value))} /></div>
                     <div><Label>Customs Duty (%)</Label><Input type="number" value={localSheetData.taxConfig.customsDuty} onChange={e => handleFieldChange('taxConfig.customsDuty', Number(e.target.value))} /></div>
                     <div><Label>Other Taxes (%)</Label><Input type="number" value={localSheetData.taxConfig.otherTaxes} onChange={e => handleFieldChange('taxConfig.otherTaxes', Number(e.target.value))} /></div>
                </CardContent></Card>
            </TabsContent>
            
            <TabsContent value="summary" className="flex-grow p-1">
                 <Card className="h-full"><CardHeader><CardTitle>Cost Summary</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                        <div><Label className="text-sm font-medium text-gray-500">Total Material Cost</Label><div className="font-semibold">{currencySymbol[localSheetData.selectedCurrency]}{(calculateTotalMaterialCost() ?? 0).toFixed(2)}</div></div>
                        <div><Label className="text-sm font-medium text-gray-500">Total Labor Cost</Label><div className="font-semibold">{currencySymbol[localSheetData.selectedCurrency]}{(calculateTotalLaborCost() ?? 0).toFixed(2)}</div></div>
                        <div><Label className="text-sm font-medium text-gray-500">Total Overhead Cost</Label><div className="font-semibold">{currencySymbol[localSheetData.selectedCurrency]}{(calculateTotalOverheadCost() ?? 0).toFixed(2)}</div></div>
                        <div className="font-bold"><Label className="text-sm font-medium text-gray-500">Subtotal</Label><div className="font-semibold">{currencySymbol[localSheetData.selectedCurrency]}{(calculateSubtotal() ?? 0).toFixed(2)}</div></div>
                        <div><Label className="text-sm font-medium text-gray-500">Total Tax</Label><div className="font-semibold">{currencySymbol[localSheetData.selectedCurrency]}{(calculateTaxes() ?? 0).toFixed(2)}</div></div>
                        <div className="font-bold"><Label className="text-sm font-medium text-gray-500">Total Cost (COGS)</Label><div className="font-semibold">{currencySymbol[localSheetData.selectedCurrency]}{(calculateTotalCost() ?? 0).toFixed(2)}</div></div>
                        <div className="col-span-2 border-t pt-4 mt-4"><Label className="text-sm font-medium text-gray-500">Recommended Selling Price</Label><div className="text-2xl font-bold text-green-600">{currencySymbol[localSheetData.selectedCurrency]}{(calculateSellingPrice() ?? 0).toFixed(2)}</div></div>
                    </div>
                </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      {confirmDeleteId && (
        <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to delete this costing sheet?</div>
            <DialogFooter>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default function CostingCalculatorWithBoundary() {
  return <ErrorBoundary><CostingCalculator /></ErrorBoundary>;
}