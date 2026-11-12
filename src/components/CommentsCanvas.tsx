import { useThreads } from "@liveblocks/react/suspense";
import { PlaceThreadButton } from "./PlaceThreadButton";
import { ThreadPin } from "./ThreadPin";

export function CommentsCanvas() {
  const { threads } = useThreads();

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="isolate">
        {threads.map((thread) => (
          <ThreadPin key={thread.id} thread={thread} />
        ))}
      </div>
      <PlaceThreadButton />
    </div>
  );
}
