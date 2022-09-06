from pathlib import Path
from typing import Any, Optional

from flask import Flask, Request, Response, jsonify, make_response, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://user:pass@domain/db-name"
app.config["UPLOAD_FOLDER"] = "/path/to/pseudo_blob"
app.config["RELATIVE_FOLDER"] = "/path/to/parent/pseudo_blob/"
app.config["JWT_SECRET_KEY"] = "dummysecretkeydonotuseinprod"
app.config["ALLOWED_EXTENSIONS"] = set(["png", "jpg", "jpeg"])

db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

from .models import PotatoPhoto, User


@app.route("/")
def backend_home():
    return "The backend server is up and running!"


# Create image
@app.route("/api/v1/uploadImage", methods=["POST"])
@jwt_required()
def upload_image() -> Response:
    curr_req: Request = request
    image_file: Optional[Any] = curr_req.files["file"] if curr_req.files else None
    if not image_file:
        return make_response(
            jsonify({"message": "Image file is missing from the request."}), 400
        )

    image_name: str = curr_req.form["name"] if "name" in curr_req.form else ""
    if not image_name:
        return make_response(
            jsonify(
                {"message": "Image name or description is missing from the request."}
            ),
            400,
        )

    image_processing: str = (
        curr_req.form["processing"] if "processing" in curr_req.form else ""
    )
    if not image_processing:
        return make_response(
            jsonify({"message": "Image processing is missing from the request."}), 400
        )

    file_extension: str = image_file.content_type.split("/")[-1]
    new_image: PotatoPhoto = PotatoPhoto(
        name=image_name,
        extension=file_extension,
        user_id=get_jwt_identity(),
        blob_dpath=app.config["UPLOAD_FOLDER"],
        relative_dpath=app.config["RELATIVE_FOLDER"],
        processing=image_processing,
    )

    # update db
    new_image.save()

    # save original and processed images to "blob"
    image_file.save(Path(app.config["RELATIVE_FOLDER"], new_image.original_image_fpath))
    new_image.process(app.config["RELATIVE_FOLDER"])

    return make_response(
        jsonify({"message": f"{new_image} successfully uploaded."}), 201
    )


# Delete image
@app.route("/api/v1/deleteImage/<id>", methods=["DELETE"])
@jwt_required()
def delete_image(id: int) -> Response:
    image: Optional[PotatoPhoto] = PotatoPhoto.query.filter_by(id=id).first()
    if not image:
        return make_response(jsonify({"message": f"Image (id: {id}) not found."}), 404)

    image.delete()
    return make_response(jsonify({"message": f"Image (id: {id}) deleted."}), 200)


# Create user
@app.route("/api/v1/signup", methods=["POST"])
def create_user() -> Response:
    curr_req: Request = request
    username: str = curr_req.form["username"] if "username" in curr_req.form else ""
    password: str = curr_req.form["password"] if "password" in curr_req.form else ""
    if not username or not password:
        return make_response(
            jsonify({"message": "Username or password is missing from the request."}),
            400,
        )

    if User.query.filter_by(username=username).first():
        return make_response(jsonify({"message": "Username unavailable."}), 200)

    hashed_password: str = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user: User = User(username=username, password=hashed_password)
    new_user.save()
    return make_response(jsonify({"message": f"{new_user} created."}), 201)


# Log in
@app.route("/api/v1/login", methods=["POST"])
def login() -> Response:
    curr_req: Request = request
    username: str = curr_req.form["username"] if "username" in curr_req.form else ""
    user: Optional[User] = User.query.filter_by(username=username).first()
    if not user:
        return make_response(
            jsonify({"message": f"User (username: {username}) not found."}), 404
        )

    password: str = curr_req.form["password"] if "password" in curr_req.form else ""
    if not password:
        return make_response(
            jsonify({"message": "Password is missing from the request."}), 400
        )

    if bcrypt.check_password_hash(user.password, password):
        access_token: str = create_access_token(identity=user.id)
        return make_response(
            jsonify(
                {
                    "message": f"{user} successfully logged in.",
                    "access_token": access_token,
                }
            ),
            200,
        )
    else:
        return make_response(jsonify({"message": "Incorrect password."}), 200)


# User home/dashboard
@app.route("/api/v1/getUserImages", methods=["GET"])
@jwt_required()
def user_dashboard() -> Response:
    user_images: list[PotatoPhoto] = PotatoPhoto.query.filter_by(
        user_id=get_jwt_identity()
    )
    return make_response(
        jsonify({"images": [image.info() for image in user_images]}), 200
    )


@app.route("/api/v1/logout", methods=["GET", "POST"])
@jwt_required()
def logout() -> Response:
    return make_response(
        jsonify({"message": "Successfully logged out.", "redirect_url": "/login"}), 200
    )
