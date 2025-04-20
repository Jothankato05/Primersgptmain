// Sample Flutter code snippet to send a base64 image to the PrimerGPT backend

import 'dart:convert';
import 'package:http/http.dart' as http;

Future<bool> sendImageToBackend(String base64Image, String authToken) async {
  final url = Uri.parse('http://your-backend-domain/api/upload-image');

  final response = await http.post(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $authToken', // Adjust if using cookie auth
    },
    body: jsonEncode({
      'imageBase64': base64Image,
    }),
  );

  if (response.statusCode == 200) {
    print('Image uploaded successfully');
    return true;
  } else {
    print('Failed to upload image: ${response.body}');
    return false;
  }
}
