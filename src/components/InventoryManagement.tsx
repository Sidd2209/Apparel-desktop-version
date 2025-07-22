import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import { getInventoryItems, getInventoryHistory } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, AlertTriangle, Package, TrendingUp, Search, Plus } from 'lucide-react';

const GET_INVENTORY_ITEMS = gql`
  query GetInventoryItems {
    inventoryItems {
      id
      name
      category
      currentStock
      minStock
      maxStock
      unit
      unitCost
      totalValue
      location
      lastUpdated
      supplier
    }
  }
`;

const CREATE_INVENTORY_ITEM = gql`
  mutation CreateInventoryItem($input: CreateInventoryItemInput!) {
    createInventoryItem(input: $input) {
      id
    }
  }
`;

const UPDATE_INVENTORY_ITEM = gql`
  mutation UpdateInventoryItem($id: ID!, $input: UpdateInventoryItemInput!) {
    updateInventoryItem(id: $id, input: $input) {
      id
    }
  }
`;

const DELETE_INVENTORY_ITEM = gql`
  mutation DeleteInventoryItem($id: ID!) {
    deleteInventoryItem(id: $id) {
      id
    }
  }
`;

const GET_INVENTORY_HISTORY = gql`
  query InventoryHistory($itemId: ID!) {
    inventoryHistory(itemId: $itemId) {
      id
      action
      quantityChange
      previousStock
      newStock
      note
      createdAt
      user
    }
  }
`;

const CREATE_INVENTORY_REORDER = gql`
  mutation CreateInventoryReorder($input: CreateInventoryReorderInput!) {
    createInventoryReorder(input: $input) {
      id
      quantity
      supplier
      status
      note
      createdAt
      user
    }
  }
`;

const GET_INVENTORY_REORDERS = gql`
  query InventoryReorders($itemId: ID!) {
    inventoryReorders(itemId: $itemId) {
      id
      quantity
      supplier
      status
      note
      createdAt
      user
    }
  }
`;

interface InventoryItem {
  id: string;
  name: string;
  category: 'RAW_MATERIALS' | 'WIP' | 'FINISHED_GOODS';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  location: string;
  lastUpdated: string;
  supplier?: string;
  __typename?: string;
  deleted?: boolean; // Added for frontend filtering
}

type FormDataType = Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'> | InventoryItem | null;

const EMPTY_FORM_DATA: Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'> = {
  name: '',
  category: 'RAW_MATERIALS',
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  unit: '',
  unitCost: 0,
  location: '',
  supplier: '',
};

const InventoryManagement: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(null);
  const [viewHistoryItem, setViewHistoryItem] = useState<InventoryItem | null>(null);
  const [reorderItem, setReorderItem] = useState<InventoryItem | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState('');
  const [reorderForm, setReorderForm] = useState({ quantity: '', supplier: '', note: '' });

  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createInventoryItem, { loading: creating }] = useMutation(CREATE_INVENTORY_ITEM, {
    refetchQueries: [{ query: GET_INVENTORY_ITEMS }],
    onCompleted: () => {
      refetchInventory();
      setDialogOpen(false);
    },
    onError: (err) => {
      console.error('Error creating inventory item:', err);
    },
  });
  const [updateInventoryItem] = useMutation(UPDATE_INVENTORY_ITEM, {
    refetchQueries: [{ query: GET_INVENTORY_ITEMS }],
    onCompleted: () => setDialogOpen(false),
  });
  const [deleteInventoryItem] = useMutation(DELETE_INVENTORY_ITEM, {
    refetchQueries: [{ query: GET_INVENTORY_ITEMS }],
    onCompleted: () => {
      refetchInventory(); // Force refetch after deletion
    },
  });

  const refetchInventory = () => {
    setLoading(true);
    getInventoryItems()
      .then((items) => {
        setInventoryItems(items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    refetchInventory();
  }, []);

  useEffect(() => {
    if (viewHistoryItem) {
      getInventoryHistory(viewHistoryItem.id)
        .then((history) => {
          setHistoryData(history);
        })
        .catch((err) => setError(err.message));
    } else {
      setHistoryData([]);
    }
  }, [viewHistoryItem]);

  const [createReorder, { loading: reorderLoading, error: reorderError }] = useMutation(CREATE_INVENTORY_REORDER, {
    refetchQueries: reorderItem ? [{ query: GET_INVENTORY_REORDERS, variables: { itemId: reorderItem.id } }] : [],
    onCompleted: () => {
      setReorderForm({ quantity: '', supplier: '', note: '' });
      // Optionally close dialog or show success
    }
  });

  const handleOpenDialog = (item: InventoryItem | null) => {
    if (item) {
      setIsEditing(true);
      setFormData(item);
    } else {
      setIsEditing(false);
      setFormData(EMPTY_FORM_DATA);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(null); // Always clear form data on close
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setFormData(prev => prev ? { ...prev, [name]: parsedValue } : null);
  };

  const handleSelectChange = (value: InventoryItem['category']) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, category: value } : null);
  };

  const handleSubmit = async () => {
    if (!formData) return;

    if (isEditing && 'id' in formData) {
      // This is an update
      const { id, __typename, totalValue, lastUpdated, ...input } = formData;
      const parsedInput = {
        ...input,
        currentStock: parseInt(String(input.currentStock), 10) || 0,
        minStock: parseInt(String(input.minStock), 10) || 0,
        maxStock: parseInt(String(input.maxStock), 10) || 0,
        unitCost: parseFloat(String(input.unitCost)) || 0,
      };
      if (!parsedInput.supplier) {
        delete (parsedInput as Partial<typeof parsedInput>).supplier;
      }
      await updateInventoryItem({ variables: { id, input: parsedInput } });
    } else {
      // This is a create
      const { id, __typename, totalValue, lastUpdated, ...input } = formData as any; // Cast to remove properties
      const parsedInput = {
        ...input,
        currentStock: parseInt(String(input.currentStock), 10) || 0,
        minStock: parseInt(String(input.minStock), 10) || 0,
        maxStock: parseInt(String(input.maxStock), 10) || 0,
        unitCost: parseFloat(String(input.unitCost)) || 0,
      };
      if (!parsedInput.supplier) {
        delete (parsedInput as Partial<typeof parsedInput>).supplier;
      }
      await createInventoryItem({ variables: { input: parsedInput } });
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) return 'low';
    if (item.currentStock >= item.maxStock) return 'excess';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      low: 'bg-red-100 text-red-800',
      excess: 'bg-yellow-100 text-yellow-800',
      normal: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'RAW_MATERIALS': 'bg-blue-100 text-blue-800',
      'WIP': 'bg-purple-100 text-purple-800',
      'FINISHED_GOODS': 'bg-green-100 text-green-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventoryItems.filter(item => getStockStatus(item) === 'low');
  const excessStockItems = inventoryItems.filter(item => getStockStatus(item) === 'excess');
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 md:grid-cols-10 gap-4 items-center w-full">
      <div className="flex items-center">
        <BarChart3 className="h-8 w-8 text-indigo-800" />
        <h1 className="text-3xl font-bold text-gray-900 whitespace-nowrap">
          Inventory Management
        </h1>
      </div>
      </div>  
      <Tabs defaultValue="overview" className="space-y-6 color=black">
      <TabsList className="w-full grid grid-cols-4 gap-2">
        <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
        <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{inventoryItems.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
              <div className="text-sm text-gray-600">Low Stock Alerts</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{excessStockItems.length}</div>
              <div className="text-sm text-gray-600">Excess Stock</div>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventory Items</CardTitle>
              <Button onClick={() => handleOpenDialog(null)}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-2 justify-end items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search Inventory</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Category Filter</Label>
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-55 p-1 h-10 border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="RAW_MATERIALS">Raw Materials</option>
                    <option value="WIP">Work in Progress</option>
                    <option value="FINISHED_GOODS">Finished Goods</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredInventory.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <div className="font-semibold text-lg">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.location}</div>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(getStockStatus(item))}>
                            {getStockStatus(item).toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm text-gray-500">Stock Levels</div>
                        <div className="text-lg font-semibold">
                          {item.currentStock} {item.unit}
                        </div>
                        <div className="text-sm text-gray-600">
                          Min: {item.minStock} | Max: {item.maxStock}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm text-gray-500">Unit Cost</div>
                        <div className="text-sm">${item.unitCost}</div>
                        <div className="font-medium text-sm text-gray-500 mt-1">Total Value</div>
                        <div className="text-sm font-semibold">${item.totalValue.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="font-medium text-sm text-gray-500">Last Updated</div>
                        <div className="text-sm">{new Date(item.lastUpdated).toLocaleDateString()}</div>
                        {item.supplier && (
                          <>
                            <div className="font-medium text-sm text-gray-500 mt-1">Supplier</div>
                            <div className="text-sm">{item.supplier}</div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => deleteInventoryItem({ variables: { id: item.id } })}>Delete</Button>
                        <Button variant="outline" size="sm" onClick={() => setViewHistoryItem(item)}>View History</Button>
                        <Button variant="outline" size="sm" onClick={() => { setReorderItem(item); setReorderQuantity(''); }}>Reorder</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <Card key={item.id} className="p-3 border-l-4 border-red-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            Current: {item.currentStock} {item.unit} (Min: {item.minStock})
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Reorder</Button>
                      </div>
                    </Card>
                  ))}
                  {lowStockItems.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No low stock alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-yellow-600" />
                  Excess Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {excessStockItems.map((item) => (
                    <Card key={item.id} className="p-3 border-l-4 border-yellow-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            Current: {item.currentStock} {item.unit} (Max: {item.maxStock})
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Review</Button>
                      </div>
                    </Card>
                  ))}
                  {excessStockItems.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No excess stock alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Stock movement history will be implemented here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Raw Materials</span>
                    <span className="font-semibold">
                      {inventoryItems.filter(i => i.category === 'RAW_MATERIALS').length} items
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Work in Progress</span>
                    <span className="font-semibold">
                      {inventoryItems.filter(i => i.category === 'WIP').length} items
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Finished Goods</span>
                    <span className="font-semibold">
                      {inventoryItems.filter(i => i.category === 'FINISHED_GOODS').length} items
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Raw Materials</span>
                    <span className="font-semibold">
                      ${inventoryItems.filter(i => i.category === 'RAW_MATERIALS')
                        .reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Work in Progress</span>
                    <span className="font-semibold">
                      ${inventoryItems.filter(i => i.category === 'WIP')
                        .reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Finished Goods</span>
                    <span className="font-semibold">
                      ${inventoryItems.filter(i => i.category === 'FINISHED_GOODS')
                        .reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Stock Turnover Rate</span>
                    <span className="font-semibold text-green-600">4.2x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg. Days on Hand</span>
                    <span className="font-semibold">87 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stock Accuracy</span>
                    <span className="font-semibold text-green-600">97.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input name="name" placeholder="Item Name" value={formData?.name || ''} onChange={handleInputChange} />
            <Select onValueChange={handleSelectChange} value={formData?.category || ''}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RAW_MATERIALS">Raw Materials</SelectItem>
                <SelectItem value="WIP">Work In Progress</SelectItem>
                <SelectItem value="FINISHED_GOODS">Finished Goods</SelectItem>
              </SelectContent>
            </Select>
            <Input name="currentStock" placeholder="Current Stock" type="number" value={formData?.currentStock || ''} onChange={handleInputChange} />
            <Input name="minStock" placeholder="Min Stock" type="number" value={formData?.minStock || ''} onChange={handleInputChange} />
            <Input name="maxStock" placeholder="Max Stock" type="number" value={formData?.maxStock || ''} onChange={handleInputChange} />
            <Input name="unit" placeholder="Unit (e.g., kg, meters, units)" value={formData?.unit || ''} onChange={handleInputChange} />
            <Input name="unitCost" placeholder="Unit Cost" type="number" value={formData?.unitCost || ''} onChange={handleInputChange} />
            <Input name="location" placeholder="Location" value={formData?.location || ''} onChange={handleInputChange} />
            <Input name="supplier" placeholder="Supplier (Optional)" value={formData?.supplier || ''} onChange={handleInputChange} />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit} disabled={creating}>
              {creating ? 'Adding...' : (isEditing ? 'Update Item' : 'Add Item')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewHistoryItem} onOpenChange={() => setViewHistoryItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              History for {viewHistoryItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {historyData.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <div>No history found for this item</div>
                <div className="text-sm">History will appear when you make changes to this item</div>
              </div>
            )}
            {historyData.length > 0 && (
              <div className="space-y-3">
                {historyData.map((entry: any) => {
                  let dateString = '';
                  try {
                    const d = new Date(entry.createdAt);
                    dateString = isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  } catch {
                    dateString = 'N/A';
                  }

                  const getActionColor = (action: string) => {
                    switch (action) {
                      case 'STOCK_IN': return 'text-green-600 bg-green-50';
                      case 'STOCK_OUT': return 'text-red-600 bg-red-50';
                      case 'ITEM_UPDATED': return 'text-blue-600 bg-blue-50';
                      default: return 'text-gray-600 bg-gray-50';
                    }
                  };

                  const getActionIcon = (action: string) => {
                    switch (action) {
                      case 'STOCK_IN': return '📥';
                      case 'STOCK_OUT': return '📤';
                      case 'ITEM_UPDATED': return '✏️';
                      default: return '📋';
                    }
                  };

                  return (
                    <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getActionIcon(entry.action)}</span>
                          <Badge className={`${getActionColor(entry.action)} border-0`}>
                            {entry.action.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">{dateString}</div>
                      </div>
                      
                      {entry.action === 'STOCK_IN' || entry.action === 'STOCK_OUT' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Stock Change:</span>
                            <span className={`font-semibold ${entry.action === 'STOCK_IN' ? 'text-green-600' : 'text-red-600'}`}>
                              {entry.action === 'STOCK_IN' ? '+' : '-'}{entry.quantityChange}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Stock Level:</span>
                            <span className="text-sm">
                              {entry.previousStock} → <span className="font-semibold">{entry.newStock}</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Changes Made:</div>
                          <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                            {entry.note}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!reorderItem} onOpenChange={() => { setReorderItem(null); setReorderQuantity(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reorder {reorderItem?.name}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (!reorderItem || !reorderQuantity || isNaN(Number(reorderQuantity)) || Number(reorderQuantity) <= 0) return;
              const { id, __typename, totalValue, lastUpdated, currentStock, ...rest } = reorderItem;
              await createInventoryItem({
                variables: {
                  input: {
                    ...rest,
                    currentStock: parseInt(reorderQuantity, 10),
                  }
                }
              });
              setReorderItem(null);
              setReorderQuantity('');
            }}
            className="space-y-3"
            style={{ minWidth: 280 }}
          >
            <Label htmlFor="quantity">New Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter new quantity"
              value={reorderQuantity}
              onChange={e => setReorderQuantity(e.target.value)}
              min={1}
              required
            />
            <DialogFooter>
              <Button type="submit">Add as New Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
