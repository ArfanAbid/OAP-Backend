import Subscription from "../models/subscription.model.js";
import userModel from "../models/user.model.js";

export const subscribe = async (req, res) => {
    const { email } = req.body;
    try {
        const existingSubscription = await Subscription.findOne({ email });
        if (existingSubscription) {
            return res.status(400).json({ message: "Subscription already exists" });
        }

        const newSubscription = new Subscription({ email });
        await newSubscription.save();
        res.status(201).json({ message: "Subscription created successfully" });
    } catch (error) {
        console.log("Error creating subscription:", error);
        res.status(500).json({ message: "Error creating subscription" });
    }
}

export const toggleSubscription = async (req, res) => {
    try {
        const user=await userModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.notificationsEnabled = !user.notificationsEnabled;
        await user.save();

        res.status(200).json({ message: `Notifications ${user.notificationsEnabled ? 'enabled' : 'disabled'}` });
    } catch (error) {
        console.log("Error toggling subscription:", error);
        res.status(500).json({ message: "Error toggling subscription" });
    }
}