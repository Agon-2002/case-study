import { useThreads } from "@liveblocks/react/suspense";
import { UserBadge } from "./identity/UserBadge";
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
      <div className="absolute top-3 left-3">
        <UserBadge />
      </div>
      <PlaceThreadButton />
    </div>
  );
}
