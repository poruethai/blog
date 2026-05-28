import EditorPage from "@/app/dashboard/new/page";
export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditorPage params={params} />;
}
