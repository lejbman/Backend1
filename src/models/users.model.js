import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    usuario: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" } //Referencia al carrito
});

const User = mongoose.model("User", userSchema);

export default User;
