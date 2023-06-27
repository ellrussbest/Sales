import multer from "multer";
import { v4 as uuid } from "uuid";
var MIME_TYPE;
(function (MIME_TYPE) {
    MIME_TYPE["image/png"] = "png";
    MIME_TYPE["image/jpeg"] = "jpeg";
    MIME_TYPE["image/jpg"] = "jpg";
})(MIME_TYPE || (MIME_TYPE = {}));
export const fileUpload = multer({
    limits: {
        fileSize: 500000,
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/images");
        },
        filename: (req, file, cb) => {
            let extension;
            switch (file.mimetype) {
                case "image/jpeg":
                    extension = MIME_TYPE["image/jpeg"];
                    cb(null, uuid() + "." + extension);
                    break;
                case "image/jpg":
                    extension = MIME_TYPE["image/jpg"];
                    cb(null, uuid() + "." + extension);
                    break;
                case "image/png":
                    extension = MIME_TYPE["image/png"];
                    cb(null, uuid() + "." + extension);
                default:
                    extension = file.mimetype;
                    cb(new Error("Invalid Mime Type!"), uuid() + "." + extension);
            }
        },
    }),
    fileFilter: (req, file, cb) => {
        let isValid;
        switch (file.mimetype) {
            case "image/jpeg":
            case "image/jpg":
            case "image/png":
                isValid = true;
                break;
            default:
                isValid = false;
        }
        cb(null, isValid);
    },
});
