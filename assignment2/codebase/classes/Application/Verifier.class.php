<?php

namespace Application;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Verifier {

    private $secret = "tjay_secret_12345";

    public function verifyToken() {

        // get headers
        $headers = getallheaders();

        // check if Authorization header exists
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(["error" => "Missing token"]);
            exit;
        }

        // extract token (Bearer TOKEN)
        $authHeader = $headers['Authorization'];
        $token = str_replace("Bearer ", "", $authHeader);

        try {
            // decode JWT
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));

            // return decoded data
            return $decoded;

        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid token"]);
            exit;
        }
    }
}