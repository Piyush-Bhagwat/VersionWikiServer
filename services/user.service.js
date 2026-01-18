import { User } from "../models/user.model.js";


const getUser = {
    byEmail: async (email) => {
        const usr = await User.findOne({ email });

        if (usr) {
            return usr;
        } else {
            return null;
        }
    },

    byId: async (id) => {
        const usr = await User.findById(id);
        if (usr) {
            return usr;
        } else {
            return null;
        }
    },
};

export { getUser };
