import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PrimerGPT',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  File? _image;
  String _analysis = '';
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  Future<void> _getImage(ImageSource source) async {
    final XFile? image = await _picker.pickImage(source: source);
    if (image != null) {
      setState(() {
        _image = File(image.path);
        _analysis = '';
      });
      _analyzeImage();
    }
  }

  Future<void> _analyzeImage() async {
    if (_image == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final bytes = await _image!.readAsBytes();
      final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';

      final response = await http.post(
        Uri.parse('http://localhost:3000/api/upload-image'),
        headers: {
          'Content-Type': 'application/json',
          // Add your authentication token here
          'Authorization': 'Bearer YOUR_TOKEN',
        },
        body: jsonEncode({
          'imageBase64': base64Image,
        }),
      );

      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        setState(() {
          _analysis = result['analysis'];
        });
      } else {
        setState(() {
          _analysis = 'Error: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _analysis = 'Error: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PrimerGPT Camera'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            if (_image != null)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Image.file(_image!),
              ),
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(),
              ),
            if (_analysis.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(_analysis),
              ),
          ],
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            IconButton(
              icon: const Icon(Icons.photo_camera),
              onPressed: () => _getImage(ImageSource.camera),
              tooltip: 'Take a Photo',
            ),
            IconButton(
              icon: const Icon(Icons.photo_library),
              onPressed: () => _getImage(ImageSource.gallery),
              tooltip: 'Choose from Gallery',
            ),
          ],
        ),
      ),
    );
  }
}
