import 'package:flutter_test/flutter_test.dart';
import 'package:sridevimatka_app/main.dart';

void main() {
  test('app points at the sridevimatka website', () {
    expect(appName, 'sridevimatka');
    expect(siteUrl, 'https://game.sridevimatka9.live/');
  });
}
