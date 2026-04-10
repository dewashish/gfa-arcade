import { ActivityEditorClient } from "./editor-client";

export default async function ActivityEditorPage({
  params,
}: {
  params: Promise<{ gameType: string }>;
}) {
  const { gameType } = await params;

  return <ActivityEditorClient gameType={gameType} />;
}
