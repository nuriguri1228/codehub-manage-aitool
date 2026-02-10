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

interface EnvironmentData {
  name: string;
  count: number;
  color: string;
  percent: number;
}

interface EnvironmentDonutChartProps {
  data: EnvironmentData[];
  title?: string;
  total?: number;
}

export function EnvironmentDonutChart({
  data,
  title = '환경별 분포',
  total: propTotal,
}: EnvironmentDonutChartProps) {
  const total = propTotal ?? data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
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
                verticalAlign="middle"
                align="right"
                layout="vertical"
                formatter={(value: string, entry) => {
                  const item = data.find((d) => d.name === value);
                  return (
                    <span className="text-xs text-muted-foreground">
                      {value} ({item?.count ?? 0}, {item?.percent ?? 0}%)
                    </span>
                  );
                }}
              />
              <text
                x="40%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg font-bold fill-foreground"
              >
                {total}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
