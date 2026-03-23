import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { KycStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeFilename, sanitizeText } from "@/lib/security";

async function saveFile(file: File, uploadDir: string) {
  if (!file || file.size === 0) return null;
  const filename = safeFilename(file.name);
  const targetDir = path.join(process.cwd(), uploadDir, "kyc");
  await mkdir(targetDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(targetDir, filename), buffer);
  return `/uploads/kyc/${filename}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const documentType = sanitizeText(formData.get("documentType"), 40);
  const uploadDir = process.env.UPLOAD_DIR || "public/uploads";

  const frontFile = formData.get("documentFront") as File | null;
  const backFile = formData.get("documentBack") as File | null;
  const selfieFile = formData.get("selfie") as File | null;
  const addressProofFile = formData.get("addressProof") as File | null;

  const [documentFrontUrl, documentBackUrl, selfieUrl, addressProofUrl] = await Promise.all([
    frontFile ? saveFile(frontFile, uploadDir) : Promise.resolve(null),
    backFile ? saveFile(backFile, uploadDir) : Promise.resolve(null),
    selfieFile ? saveFile(selfieFile, uploadDir) : Promise.resolve(null),
    addressProofFile ? saveFile(addressProofFile, uploadDir) : Promise.resolve(null)
  ]);

  if (!documentFrontUrl) {
    return NextResponse.redirect(new URL("/dashboard/kyc?error=missing-front", request.url));
  }

  await prisma.$transaction([
    prisma.kycSubmission.create({
      data: {
        userId: session.user.id,
        status: KycStatus.PENDING,
        documentType,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        addressProofUrl,
        submittedAt: new Date()
      }
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { kycStatus: KycStatus.PENDING }
    })
  ]);

  return NextResponse.redirect(new URL("/dashboard/kyc?submitted=1", request.url));
}
