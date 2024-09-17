import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  try {
    const userInput = await req.json();
    const MAX_ATTEMPTS = 5;
    const BLOCK_DURATION = 15 * 60 * 1000;
    if (!userInput.email) {
      throw new Error("Please provide all the necessary information.");
    }

    const now = new Date();
    const loginAttempt = await db.loginAttemptCount.findFirst({
      where: { email: userInput.email },
    });

    if (loginAttempt) {
      if (
        loginAttempt.attempts >= MAX_ATTEMPTS &&
        now.getTime() - new Date(loginAttempt.last_attempt).getTime() <
          BLOCK_DURATION
      ) {
        return NextResponse.json(
          {
            blocked: true,
            timeLeft:
              BLOCK_DURATION -
              (now.getTime() - new Date(loginAttempt.last_attempt).getTime()),
            remaining_attempts: 0,
          },
          { status: 200 }
        );
      }
      if (
        now.getTime() - new Date(loginAttempt.last_attempt).getTime() >
        BLOCK_DURATION
      ) {
        const newAttempt = await db.loginAttemptCount.update({
          where: { email: userInput.email },
          data: {
            attempts: 1,
            last_attempt: now,
          },
        });
        return NextResponse.json(
          {
            blocked: false,
            remaining_attempts: MAX_ATTEMPTS - newAttempt.attempts,
          },
          { status: 200 }
        );
      }
      const newAttempt = await db.loginAttemptCount.update({
        where: { email: userInput.email },
        data: {
          attempts: {
            increment: 1,
          },
          last_attempt: now,
        },
      });
      return NextResponse.json(
        {
          blocked: false,
          remaining_attempts: MAX_ATTEMPTS - newAttempt.attempts,
        },
        { status: 200 }
      );
    } else {
      const attempt = await db.loginAttemptCount.create({
        data: { email: userInput.email, attempts: 1, last_attempt: now },
      });
      return NextResponse.json(
        {
          blocked: false,
          remaining_attempts: MAX_ATTEMPTS - attempt.attempts,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Couldn't sign user in" },
      { status: 500 }
    );
  }
}
