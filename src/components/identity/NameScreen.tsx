"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NAME_MAX_LENGTH, nameSchema } from "@/lib/identity";

type NameScreenProps = {
  defaultName?: string;
  /** An error from the server, such as the name being in use */
  serverError?: string;
  onSubmit: (name: string) => void;
};

export function NameScreen({
  defaultName = "",
  serverError,
  onSubmit,
}: NameScreenProps) {
  const [name, setName] = useState(defaultName);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const error = fieldError ?? serverError;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = nameSchema.safeParse(name);
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Invalid name.");
      return;
    }
    setFieldError(null);
    onSubmit(result.data);
  }

  return (
    <main className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join the image comments</CardTitle>
          <CardDescription>
            Your name appears on the comments you write.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                autoFocus
                maxLength={NAME_MAX_LENGTH}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFieldError(null);
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "name-error" : undefined}
              />
              {error ? (
                <p id="name-error" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
            <Button type="submit">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
