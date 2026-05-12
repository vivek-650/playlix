import { Webhook } from "svix"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  // Get the headers
  const headersList = await headers()
  const svix_id = headersList.get("svix-id")
  const svix_timestamp = headersList.get("svix-timestamp")
  const svix_signature = headersList.get("svix-signature")

  // If no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get body
  const body = await req.text()

  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: any

  // Verify webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    if (eventType === "user.created") {
      const { id, first_name, last_name, email_addresses, image_url } = evt.data

      // Create user in database
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address || email,
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image_url,
        },
      })

      console.log(`User created: ${id}`)
    } else if (eventType === "user.updated") {
      const { id, first_name, last_name, email_addresses, image_url } = evt.data

      // Update user in database
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          firstName: first_name,
          lastName: last_name,
          email: email_addresses[0]?.email_address,
          avatarUrl: image_url,
        },
      })

      console.log(`User updated: ${id}`)
    } else if (eventType === "user.deleted") {
      const { id } = evt.data

      // Soft delete user
      await prisma.user.update({
        where: { clerkId: id },
        data: { deletedAt: new Date() },
      })

      console.log(`User deleted: ${id}`)
    }

    return new Response("Webhook processed", { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response("Webhook error", { status: 500 })
  }
}
