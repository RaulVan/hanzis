import { UiText } from "@/components/i18n/UiText";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function NotFound() {
  return (
    <Empty className="min-h-[60vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon"><BookOpen /></EmptyMedia>
        <EmptyTitle><UiText text="这一页还没有写下"  /></EmptyTitle>
        <EmptyDescription><UiText text="地址可能有误，或内容已移动。回到字帖，继续你的汉字练习。"  /></EmptyDescription>
      </EmptyHeader>
      <EmptyContent><Button asChild><Link href="/"><ArrowLeft data-icon="inline-start" /><UiText text="回到字帖生成"  /></Link></Button></EmptyContent>
    </Empty>
  );
}
