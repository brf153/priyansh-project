import Hotel from '../models/hotel.js';
import Room from '../models/room.js';

// CREATE operation
export const createHotel = async (req, res, next) => {
    try {
        const newHotel = new Hotel(req.body);
        await newHotel.save();
        res.status(201).json(newHotel);
    } catch (error) {
        next(error);
    }
};

// READ operation to fetch all hotels
export const getHotels = async (req, res, next) => {
    const { min, max, limit, ...otherDetails } = req.query;
    try {
        const hotels = await Hotel.find({
            ...otherDetails,
            cheapestPrice: { $gt: min || 0, $lt: max || 999999 }
        }).limit(limit);
        console.log("Total hotels = ", hotels.length);
        res.json(hotels);
    } catch (error) {
        next(error);
    }
};

// READ operation to fetch a single hotel by ID
export const getHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.json(hotel);
    } catch (error) {
        next(error);
    }
};

// UPDATE operation
export const updateHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.json(hotel);
    } catch (error) {
        next(error);
    }
};

// DELETE operation
export const deleteHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        res.json({ message: 'Hotel deleted successfully' });
    } catch (error) {
        next(error);
    }
};


// This function uses the Mongoose aggregate method to group hotels by type and count them
export const getHotelCountByType = async (req, res, next) => {

    const { limit } = req.query;
    /*
    The $group operator is a pipeline stage that groups documents 
    by a specified field and performs aggregate calculations on the grouped documents. 
    It is followed by the $sum operator, which is used to sum the values 
    of a specified field across all documents in the group.
    */

    try {
        const hotelCounts = await Hotel.aggregate([
            // The $group pipeline stage groups hotels by type and counts them
            {
                $group: {
                    _id: '$type', // Group by the "type" field
                    count: { $sum: 1 }, // Count the number of hotels in each group
                },
            },
        ]);

        const result = hotelCounts.map(({ _id, count }) => ({ type: _id, count }));
        res.status(200).json(result.slice(0, limit));
    } catch (error) {
        next(error);
    }
};


export const getAllCityHotelCount = async (req, res, next) => {

    const { limit } = req.query;

    try {
        const hotelCounts = await Hotel.aggregate([
            {
                $group: {
                    _id: '$city',
                    count: { $sum: 1 },
                },
            },
        ]);

        const result = hotelCounts.map(({ _id, count }) => ({ city: _id, count }));
        res.status(200).json(result.slice(0, limit));
    } catch (error) {
        next(error);
    }
};


export const getHotelCountByCity = async (req, res, next) => {
    const cities = req.query.cities.split(",");
    try {
        const countList = await Promise.all(
            cities.map((city) => {
                return Hotel.countDocuments({ city: city });
            })
        );

        const result = cities.map((city, index) => ({
            city: city,
            count: countList[index]
        }));

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getHotelRooms = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        const list = await Promise.all(hotel.rooms.map((roomId) => {
            return Room.findById(roomId);
        }));
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
};

export const getAllCities = async (req, res, next) => {
    try {
        const cities = await Hotel.distinct('city');
        res.json(cities);
    } catch (error) {
        next(error);
    }
}