class UserProfile {
  final String userId;
  final String fullName;
  final String phoneNumber;
  final String standardPin;
  final String duressPin;

  const UserProfile({
    required this.userId,
    required this.fullName,
    required this.phoneNumber,
    this.standardPin = '1234',
    this.duressPin = '9999',
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      userId: json['user_id'] ?? 'usr_default',
      fullName: json['full_name'] ?? 'Citizen Commuter',
      phoneNumber: json['phone_number'] ?? '+27825550199',
      standardPin: json['standard_pin'] ?? '1234',
      duressPin: json['duress_pin'] ?? '9999',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'full_name': fullName,
      'phone_number': phoneNumber,
      'standard_pin': standardPin,
      'duress_pin': duressPin,
    };
  }

  static UserProfile defaultDemoUser() {
    return const UserProfile(
      userId: 'usr_thandiwe_001',
      fullName: 'Thandiwe Ndlovu',
      phoneNumber: '+27 82 555 0199',
      standardPin: '1234',
      duressPin: '9999',
    );
  }
}
