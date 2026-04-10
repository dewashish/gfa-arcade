import { GamePlayClient } from "./game-play-client";

export default async function GamePlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <GamePlayClient sessionId={sessionId} />;
}
