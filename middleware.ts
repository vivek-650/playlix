import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  if (!isPublicRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      return (await auth()).redirectToSignIn()
    }
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
