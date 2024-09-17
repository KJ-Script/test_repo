import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: Request, res: Response) {
  try {
    const userInput = await req.json();
    if (!userInput.email || !userInput.password) {
      throw new Error("Please provide all the necessary information.");
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 10);
    const newUser = await db.user.create({
      //@ts-ignore
      data: {
        email: userInput.email,
        password: hashedPassword,
        role: userInput.role,
        first_name: userInput.firstName,
        last_name: userInput.lastName,
        phone_number: userInput.phoneNumber,
        // station_id: 1,
      },
    });
    return NextResponse.json(
      { message: "New user account created", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Couldn't create user account" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const user = await db.user.findUnique({
      where: {
        email: "jo@gmail.com",
      },
    });
    if (!user) {
      throw new Error("User not found!");
    }
    return NextResponse.json({ id: "GET", userId: user.id });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Couldn't get user account" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, res: Response) {
  try {
    return NextResponse.json({ id: "PUT" });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Couldn't update user account" },
      { status: 500 }
    );
  }
}
