import Cafe from "../model/Cafe.js";

export const getAllCafes = async (req, res) => {
    try {
      const cafes = await Cafe.find().sort({ createdAt: -1 });
      res.json(cafes);
    } catch (error) {
      res.status(500).json({ msg: "Server error" });
    }
  };
  
  
  export const addCafe = async (req, res) => {
    try {
      const { name, address, location, assignedTo } = req.body;
  
      if (!name || !address || !location || !assignedTo) {
        return res.status(400).json({ msg: "All fields are required." });
      }
  
      const newCafe = new Cafe({
        name,
        address,
        location,
        createdBy: req.user.id, // admin ID
        assignedTo,             // café owner's user ID
      });
  
      await newCafe.save();
  
      const io = req.app.get("io");
      io.emit("cafe-updated");
  
      res.status(201).json({ msg: "Cafe added successfully", cafe: newCafe });
    } catch (err) {
      console.error("Error adding cafe:", err.message);
      res.status(500).json({ msg: "Server Error" });
    }
  };  
  
export const getCafeById = async (req, res) => {
    try {
      const cafe = await Cafe.findById(req.params.id);
      if (!cafe) return res.status(404).json({ msg: "Cafe not found" });
      res.json(cafe);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
  
  export const updateCafe = async (req, res) => {
    try {
      const { name, address, location } = req.body;
      const cafe = await Cafe.findByIdAndUpdate(
        req.params.id,
        { name, address, location },
        { new: true }
      );
  
      if (!cafe) return res.status(404).json({ msg: "Cafe not found" });
  
      const io = req.app.get("io");
      io.emit("cafe-updated");
  
      res.json({ msg: "Cafe updated", cafe });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
  
  
  
  export const deleteCafe = async (req, res) => {
    try {
      const cafe = await Cafe.findByIdAndDelete(req.params.id);
      if (!cafe) return res.status(404).json({ msg: "Cafe not found" });

      const io = req.app.get("io");
      io.emit("cafe-updated");
  
      res.json({ msg: "Cafe deleted successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
  