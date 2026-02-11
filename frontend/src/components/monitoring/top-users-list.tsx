'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { TopUser } from '@/types';

interface TopUsersListProps {
  data: TopUser[];
  title?: string;
}

export function TopUsersList({
  data,
  title = 'Top 5 사용자',
}: TopUsersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((user, index) => (
            <div key={user.userId} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{user.userName}</span>
                  <span className="text-muted-foreground">
                    {user.tokensUsed.toLocaleString()} 토큰
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={user.percentage} className="h-1.5 flex-1" />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {user.percentage}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.department}
                </p>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              데이터가 없습니다.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
