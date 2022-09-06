import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from PIL import Image

from .app import db


class PotatoPhoto(db.Model):
    __tablename__ = "images"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    processing = db.Column(
        db.Enum(
            "rotate_90deg_clockwise", "annotate_circles", name="image_processing_types"
        ),
        nullable=False,
    )
    original_image_fpath = db.Column(db.String(), nullable=False)
    processed_image_fpath = db.Column(db.String(), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"Image: (id: {self.id}, name: {self.name})"

    def __init__(
        self,
        name: str,
        extension: str,
        user_id: int,
        blob_dpath: str,
        relative_dpath: str,
        processing: str = "rotate_90deg_clockwise",
    ) -> None:
        self.name = name
        self.user_id = user_id
        self.processing = processing

        # format file names
        new_uuid = uuid.uuid4().hex
        original_image_fname = (
            f"{new_uuid}_{self.processing}_original_{name}.{extension}"
        )
        processed_image_fname = (
            f"{new_uuid}_{self.processing}_processed_{name}.{extension}"
        )

        # set image fpaths
        self.original_image_fpath = str(
            Path(blob_dpath, original_image_fname)
            .resolve()
            .relative_to(Path(relative_dpath))
        )
        self.processed_image_fpath = str(
            Path(blob_dpath, processed_image_fname)
            .resolve()
            .relative_to(Path(relative_dpath))
        )

    def save(self) -> None:
        db.session.add(self)
        db.session.commit()

    def delete(self) -> None:
        db.session.delete(self)
        db.session.commit()

    def info(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
            "processing": self.processing,
            "original_image_fpath": self.original_image_fpath,
            "processed_image_fpath": self.processed_image_fpath,
            "created_at": self.created_at,
        }

    def process(self, relative_dpath: str) -> None:
        if self.processing == "rotate_90deg_clockwise":
            with Image.open(Path(relative_dpath, self.original_image_fpath)) as im:
                im.rotate(-90).save(Path(relative_dpath, self.processed_image_fpath))
        elif self.processing == "annotate_circles":
            im = cv2.imread(str(Path(relative_dpath, self.original_image_fpath)))
            output = im.copy()
            gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
            circles = cv2.HoughCircles(
                gray, cv2.HOUGH_GRADIENT, 1, 20, param1=50, param2=30, maxRadius=30
            )
            if circles is not None:
                circles = np.round(circles[0, :]).astype("int")
                for (x, y, r) in circles:
                    cv2.circle(output, (x, y), r, (0, 255, 0), 4)
                    cv2.rectangle(
                        output, (x - 5, y - 5), (x + 5, y + 5), (0, 128, 255), -1
                    )

            cv2.imwrite(str(Path(relative_dpath, self.processed_image_fpath)), output)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)

    def __repr__(self) -> str:
        return f"User: (id: {self.id}, username: {self.username})"

    def save(self) -> None:
        db.session.add(self)
        db.session.commit()
