import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Product, SampleStatus, DevelopmentStage } from '@/types';
import { User, Calendar, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ProductStatus } from '@/types/index';

interface ProductCardProps {
  product: Product;
}

const stageProgress = {
  [DevelopmentStage.IDEATION]: 10,
  [DevelopmentStage.INITIAL_DESIGN]: 25,
  [DevelopmentStage.TECH_PACK]: 40,
  [DevelopmentStage.PROTO_SAMPLE]: 60,
  [DevelopmentStage.FIT_SAMPLE]: 80,
  [DevelopmentStage.FINAL_APPROVAL]: 100,
};

const statusColors: Record<string, string> = {
  [ProductStatus.CONCEPT]: 'bg-gray-500',
  [ProductStatus.DESIGN]: 'bg-blue-500',
  [ProductStatus.SAMPLING]: 'bg-purple-500',
  [ProductStatus.APPROVED]: 'bg-green-500',
  [ProductStatus.PRODUCTION_READY]: 'bg-emerald-500',
  [ProductStatus.DISCONTINUED]: 'bg-red-500',
};


const getSampleStatusIcon = (status: SampleStatus) => {
  switch (status) {
    case SampleStatus.APPROVED:
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case SampleStatus.REVISION_NEEDED:
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    case SampleStatus.READY_REVIEW:
      return <Clock className="h-4 w-4 text-blue-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const formatStatusText = (status: string | SampleStatus): string => {
  if (typeof status === 'string') {
    return status.toLowerCase().replace(/_/g, ' ');
  }
  // Convert enum value to string and then format
  return SampleStatus[status as keyof typeof SampleStatus].toLowerCase().replace(/_/g, ' ');
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const progress = stageProgress[product.developmentStage as keyof typeof stageProgress] || 0;
  const activeSamples = product.samples.filter(
    s => s.status !== SampleStatus.APPROVED && 
         s.status !== SampleStatus.REJECTED
  ).length;


  const latestSample = product.samples.length > 0 ? product.samples[0] : null;
  const getStatusBadge = (status: string) => {
    const statusKey = status.toUpperCase() as keyof typeof ProductStatus;
    const color = statusColors[status] || 'bg-gray-500';
    return (
      <Badge className={`${color} text-white`}>
        {formatStatusText(status)}
      </Badge>
    );
  };
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {product.name}
          </CardTitle>
          <Badge className={`${statusColors[product.status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
            {formatStatusText(product.status)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{product.sku} • {product.category}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Development Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 capitalize">
            Current stage: {formatStatusText(product.developmentStage)}
          </p>
        </div>

        {/* Sample Status Section */}
        {latestSample && (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">Latest Sample</span>
      <div className="flex items-center gap-2">
        <Badge 
          className={
            latestSample.status === SampleStatus.APPROVED 
              ? 'bg-green-100 text-green-800' 
              : latestSample.status === SampleStatus.REVISION_NEEDED 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-blue-100 text-blue-800'
          }
        >
          {formatStatusText(latestSample.status as SampleStatus)}
        </Badge>
        {getSampleStatusIcon(latestSample.status as SampleStatus)}
      </div>
    </div>
    {latestSample.notes && (
      <p className="text-xs text-gray-600 line-clamp-2">
        {latestSample.notes}
      </p>
    )}
  </div>
)}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{product.designer || 'No designer'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{product.season || 'No season'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{product.designFiles?.length || 0} files</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-medium">
              {activeSamples} active samples
            </span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Updated {new Date(product.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;