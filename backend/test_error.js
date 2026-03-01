import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Profile from './models/profile.model.js';
import User from './models/user.model.js';
import dns from 'node:dns/promises';

dns.setServers(["1.1.1.1"]);
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const userProfiles = await Profile.find({ leetcodeUsername: { $ne: '' } });
        console.log("Profiles with LeetCode username:", userProfiles.map(p => ({
            username: p.leetcodeUsername,
            visibility: p.leetcodeVisibility,
            userId: p.userId
        })));
        
        if (userProfiles.length > 0) {
            const testUsername = userProfiles[0].leetcodeUsername;
            console.log("Testing with username:", testUsername);
            
            // Try fetching from the local server to get the exact error
            const { default: axios } = await import('axios');
            try {
                console.log("Hitting API /api/leetcode/stats...");
                const res = await axios.get(`http://localhost:9090/api/leetcode/stats?username=${testUsername}`);
                console.log("Success:", res.data);
            } catch (err) {
                console.error("Stats Route Error:", err.response ? err.response.data : err.message);
            }
            
            try {
                console.log("Hitting API /api/leetcode/test-stats...");
                const res2 = await axios.get(`http://localhost:9090/api/leetcode/test-stats?username=${testUsername}`);
                console.log("Test Route Success:", res2.data);
            } catch (err) {
                console.error("Test Route Error:", err.response ? err.response.data : err.message);
            }
        }
    } catch (err) {
        console.error("Script error:", err);
    } finally {
        mongoose.disconnect();
    }
};

run();
