'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ToolDistribution } from '@/types';

interface LicenseDonutChartProps {
  data: ToolDistribution[];
  title?: string;
  centerLabel?: string;
  centerValue?: number;
}

export function LicenseDonutChart({
  data,
  title = '도구별 라이센스 분포',
  centerLabel = '총 라이센스',
  centerValue,
}: LicenseDonutChartProps) {
  const total = centerValue ?? data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                nameKey="toolName"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value?: number, name?: string) => [
                  `${value ?? 0}개 (${Math.round(((value ?? 0) / total) * 100)}%)`,
                  name ?? '',
                ]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-foreground"
              >
                {total}
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {centerLabel}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
