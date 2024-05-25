"use server";

import db from "@/db/db";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function orderCreation({
  email,
  productId,
  priceInCents,
}: {
  email: string;
  productId: string;
  priceInCents: number;
}) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (product == null || email == null) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const userFields = {
    email,
    orders: { create: { productId, pricePaidInCents: priceInCents } },
  };
  const {
    orders: [order],
  } = await db.user.upsert({
    where: { email },
    create: userFields,
    update: userFields,
    select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  //   const downloadVerification = await db.downloadVerification.create({
  //     data: {
  //       productId,
  //       expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  //     },
  //   });

  //   await resend.emails.send({
  //     from: `Support <${process.env.SENDER_EMAIL}>`,
  //     to: email,
  //     subject: "Order Confirmation",
  //     react: (
  //       <PurchaseReceiptEmail
  //         order={order}
  //         product={product}
  //         downloadVerificationId={downloadVerification.id}
  //       />
  //     ),
  //   });
}
