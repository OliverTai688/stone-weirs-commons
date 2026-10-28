import { InterviewTool } from "@/components/interview/InterviewTool";

export const metadata = { title: "工具一：故事轉概念圖" };

export default function InterviewPage() {
  return (
    <div className="container-page py-8">
      <p className="eyebrow">工具一・Pilot</p>
      <h1 className="mt-1 text-3xl font-bold">用說的，留下你的故事</h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        不需要懂 CIDOC-CRM。AI 會像訪談者一樣，從人物、地點、事件、器物、詞彙、關係與治理七個面向追問，同時把你說的內容畫成概念圖。AI 只用你說過的話，推測的部分會標成虛線，等你確認。
      </p>
      <div className="mt-6"><InterviewTool /></div>
    </div>
  );
}
