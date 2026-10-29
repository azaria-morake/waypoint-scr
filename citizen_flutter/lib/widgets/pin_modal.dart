import 'package:flutter/material.dart';

class PinModal extends StatefulWidget {
  final bool isDuressMode;
  final String title;
  final Future<void> Function(String pin) onSubmitPin;

  const PinModal({
    super.key,
    this.isDuressMode = false,
    this.title = 'Enter Security PIN',
    required this.onSubmitPin,
  });

  static Future<void> show({
    required BuildContext context,
    bool isDuressMode = false,
    String? title,
    required Future<void> Function(String pin) onSubmitPin,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => PinModal(
        isDuressMode: isDuressMode,
        title: title ?? (isDuressMode ? 'Duress Security PIN' : 'Enter Security PIN to Disarm'),
        onSubmitPin: onSubmitPin,
      ),
    );
  }

  @override
  State<PinModal> createState() => _PinModalState();
}

class _PinModalState extends State<PinModal> {
  String _pin = '';
  bool _isLoading = false;
  String? _errorMessage;

  void _handleDigit(String digit) {
    if (_pin.length < 4 && !_isLoading) {
      setState(() {
        _pin += digit;
        _errorMessage = null;
      });
      if (_pin.length == 4) {
        _submitPin(_pin);
      }
    }
  }

  void _handleDelete() {
    if (_pin.isNotEmpty && !_isLoading) {
      setState(() {
        _pin = _pin.substring(0, _pin.length - 1);
        _errorMessage = null;
      });
    }
  }

  Future<void> _submitPin(String pinValue) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await widget.onSubmitPin(pinValue);
      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception:', '').trim();
          _pin = '';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 24,
        left: 24,
        right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 28,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black54,
            blurRadius: 30,
            offset: Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: widget.isDuressMode
                          ? const Color(0xFFFEF3C7)
                          : const Color(0xFFD1FAE5),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      widget.isDuressMode ? Icons.warning_rounded : Icons.lock_outline_rounded,
                      color: widget.isDuressMode
                          ? const Color(0xFFB45309)
                          : const Color(0xFF047857),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.title,
                        style: const TextStyle(
                          color: Color(0xFF0F172A),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        widget.isDuressMode
                            ? 'Silent Hostage / Coercion protocol'
                            : 'Safe Disarm Protocol',
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close, color: Color(0xFF94A3B8)),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // 4-Dot Indicator
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(4, (index) {
              final isFilled = _pin.length > index;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                margin: const EdgeInsets.symmetric(horizontal: 10),
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isFilled ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                  border: Border.all(
                    color: isFilled ? const Color(0xFF0F172A) : const Color(0xFFCBD5E1),
                    width: 2,
                  ),
                ),
              );
            }),
          ),

          if (_errorMessage != null) ...[
            const SizedBox(height: 12),
            Text(
              _errorMessage!,
              style: const TextStyle(
                color: Color(0xFFDC2626),
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],

          const SizedBox(height: 24),

          // Numeric Keypad
          SizedBox(
            width: 270,
            child: Column(
              children: [
                _buildKeypadRow(['1', '2', '3']),
                const SizedBox(height: 12),
                _buildKeypadRow(['4', '5', '6']),
                const SizedBox(height: 12),
                _buildKeypadRow(['7', '8', '9']),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SizedBox(width: 76, height: 56), // spacer
                    _buildKeypadButton('0'),
                    _buildDeleteButton(),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Divider(color: Color(0xFFF1F5F9)),
          const SizedBox(height: 10),

          // Quick Test Protocol Shortcuts
          const Text(
            'QUICK TEST PROTOCOLS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isLoading ? null : () => _submitPin('1234'),
                  style: OutlinedButton.styleFrom(
                    backgroundColor: const Color(0xFFECFDF5),
                    side: const BorderSide(color: Color(0xFFA7F3D0)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    '1234 (Safe Disarm)',
                    style: TextStyle(
                      color: Color(0xFF065F46),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: _isLoading ? null : () => _submitPin('9999'),
                  style: OutlinedButton.styleFrom(
                    backgroundColor: const Color(0xFFFEF2F2),
                    side: const BorderSide(color: Color(0xFFFECACA)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    '9999 (Duress Hostage)',
                    style: TextStyle(
                      color: Color(0xFF991B1B),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKeypadRow(List<String> digits) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: digits.map((d) => _buildKeypadButton(d)).toList(),
    );
  }

  Widget _buildKeypadButton(String digit) {
    return InkWell(
      onTap: () => _handleDigit(digit),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 76,
        height: 56,
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
        ),
        alignment: Alignment.center,
        child: Text(
          digit,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Color(0xFF0F172A),
          ),
        ),
      ),
    );
  }

  Widget _buildDeleteButton() {
    return InkWell(
      onTap: _handleDelete,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 76,
        height: 56,
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(16),
        ),
        alignment: Alignment.center,
        child: const Icon(
          Icons.backspace_outlined,
          color: Color(0xFF475569),
          size: 22,
        ),
      ),
    );
  }
}
