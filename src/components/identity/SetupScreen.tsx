import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Shown when the server has no Liveblocks secret key configured. */
export function SetupScreen() {
  return (
    <main className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup needed</CardTitle>
          <CardDescription>
            The server has no Liveblocks secret key.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>
            Create a <code>.env.local</code> file in the project root with your
            secret key from the Liveblocks dashboard:
          </p>
          <pre className="rounded-md bg-muted p-3 text-xs">
            LIVEBLOCKS_SECRET_KEY=sk_...
          </pre>
          <p>Then restart the dev server and reload this page.</p>
        </CardContent>
      </Card>
    </main>
  );
}
