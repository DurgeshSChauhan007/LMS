import { clerkClient } from "@clerk/express";

// Middleware ( Protect Educator Routes )
export const protecteducator = async(req, res, next) => {
    try {
        const userId = req.auth.userId;
        const response = await clerkClient.users.getUser(userId);

        if (response.publicMetadata.role != 'educator') {
            return res.json({success: false, message: 'Unauthorised Access'})
        }

        next()
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}