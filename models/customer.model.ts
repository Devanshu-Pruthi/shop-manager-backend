import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPhone {
    brand: string;
    model: string;
    imeiNumber: string;
    price: number;
    condition: 'New' | 'Old';
    purchaseDate: Date;
}

export interface IExchangePhone {
    brand: string;
    model: string;
    imeiNumber: string;
    estimatedValue: number;
}

export interface ICustomer extends Document {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    referredBy?: string;
    phones: IPhone[];
    exchangePhones: IExchangePhone[];
    totalPurchaseAmount: number;
    paymentMethod: 'Cash' | 'Card' | 'UPI' | 'EMI' | 'Replacement';
    registrationDate: Date;
    lastVisit: Date;
    notes?: string;
    adharNumber?: string;
    adharPhotoFront?: string;
    adharPhotoBack?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PhoneSchema = new Schema<IPhone>({
    brand: String,
    model: String,
    imeiNumber: String,
    price: Number,
    condition: {
        type: String,
        enum: ['New', 'Old'],
        default: 'New'
    },
    purchaseDate: Date
});

const ExchangePhoneSchema = new Schema<IExchangePhone>({
    brand: String,
    model: String,
    imeiNumber: String,
    estimatedValue: Number
});

const CustomerSchema = new Schema<ICustomer>({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number'],
        match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit phone number starting with 6-9']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: String,
    city: String,
    state: String,
    referredBy: String,
    phones: [PhoneSchema],
    exchangePhones: [ExchangePhoneSchema],
    totalPurchaseAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'EMI', 'Replacement'],
        default: 'Cash'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date,
        default: Date.now
    },
    notes: String,
    adharNumber: String,
    adharPhotoFront: String,
    adharPhotoBack: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

CustomerSchema.virtual('id').get(function (this: ICustomer) {
    return this._id.toHexString();
});

const Customer: Model<ICustomer> = mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
