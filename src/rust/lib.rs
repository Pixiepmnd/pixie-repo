// High-performance Rust core for Pixie
// Provides FFI bindings for TypeScript integration

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedIntent {
    pub action: String,
    pub entities: HashMap<String, String>,
    pub confidence: f64,
    pub raw_text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenInfo {
    pub symbol: String,
    pub mint: String,
    pub decimals: u8,
    pub price_usd: f64,
}

/// Fast intent parsing using Rust
pub fn parse_intent_fast(input: &str) -> ParsedIntent {
    let normalized = input.to_lowercase();
    let mut entities = HashMap::new();
    
    // Extract action
    let action = extract_action(&normalized);
    
    // Extract entities based on action
    match action.as_str() {
        "send" => {
            if let Some(amount) = extract_amount(&normalized) {
                entities.insert("amount".to_string(), amount.to_string());
            }
            if let Some(token) = extract_token(&normalized) {
                entities.insert("token".to_string(), token);
            }
            if let Some(recipient) = extract_address(&normalized) {
                entities.insert("recipient".to_string(), recipient);
            }
        }
        "swap" => {
            if let Some(amount) = extract_amount(&normalized) {
                entities.insert("amount".to_string(), amount.to_string());
            }
            if let Some(from_token) = extract_source_token(&normalized) {
                entities.insert("sourceToken".to_string(), from_token);
            }
            if let Some(to_token) = extract_target_token(&normalized) {
                entities.insert("targetToken".to_string(), to_token);
            }
        }
        _ => {}
    }
    
    let confidence = calculate_confidence(&action, &entities);
    
    ParsedIntent {
        action,
        entities,
        confidence,
        raw_text: input.to_string(),
    }
}

fn extract_action(input: &str) -> String {
    if input.contains("send") || input.contains("transfer") || input.contains("pay") {
        return "send".to_string();
    }
    if input.contains("swap") || input.contains("exchange") || input.contains("trade") {
        return "swap".to_string();
    }
    if input.contains("stake") && !input.contains("unstake") {
        return "stake".to_string();
    }
    if input.contains("unstake") {
        return "unstake".to_string();
    }
    if input.contains("balance") || input.contains("how much") {
        return "balance".to_string();
    }
    if input.contains("buy") || input.contains("purchase") {
        return "purchase".to_string();
    }
    if input.contains("price") {
        return "price".to_string();
    }
    
    "chat".to_string()
}

fn extract_amount(input: &str) -> Option<f64> {
    // Regex-like pattern matching for amounts
    let words: Vec<&str> = input.split_whitespace().collect();
    
    for (i, word) in words.iter().enumerate() {
        if let Ok(amount) = word.parse::<f64>() {
            return Some(amount);
        }
        
        // Check for patterns like "5sol" or "10usdc"
        if word.len() > 1 {
            let numeric_part: String = word.chars()
                .take_while(|c| c.is_numeric() || *c == '.')
                .collect();
            
            if let Ok(amount) = numeric_part.parse::<f64>() {
                return Some(amount);
            }
        }
    }
    
    None
}

fn extract_token(input: &str) -> Option<String> {
    let tokens = ["sol", "usdc", "usdt", "bonk", "jup", "jto", "pyth", "wen"];
    
    for token in &tokens {
        if input.contains(token) {
            return Some(token.to_uppercase());
        }
    }
    
    None
}

fn extract_address(input: &str) -> Option<String> {
    let words: Vec<&str> = input.split_whitespace().collect();
    
    for word in words {
        if word.len() >= 32 && word.len() <= 44 {
            // Basic check for base58 characters
            if word.chars().all(|c| {
                c.is_alphanumeric() && c != '0' && c != 'O' && c != 'I' && c != 'l'
            }) {
                return Some(word.to_string());
            }
        }
    }
    
    None
}

fn extract_source_token(input: &str) -> Option<String> {
    // Look for patterns like "swap SOL" or "from SOL"
    if let Some(pos) = input.find("from") {
        let after_from = &input[pos + 4..];
        return extract_token(after_from);
    }
    
    extract_token(input)
}

fn extract_target_token(input: &str) -> Option<String> {
    // Look for patterns like "to USDC" or "for USDC"
    if let Some(pos) = input.find("to") {
        let after_to = &input[pos + 2..];
        return extract_token(after_to);
    }
    if let Some(pos) = input.find("for") {
        let after_for = &input[pos + 3..];
        return extract_token(after_for);
    }
    
    None
}

fn calculate_confidence(action: &str, entities: &HashMap<String, String>) -> f64 {
    if action == "chat" {
        return 0.9;
    }
    
    let mut confidence = 0.5;
    confidence += entities.len() as f64 * 0.15;
    
    confidence.min(1.0)
}

/// Optimize transaction routing
pub fn optimize_swap_route(
    input_mint: &str,
    output_mint: &str,
    amount: f64,
) -> Vec<String> {
    // Simulated route optimization
    // In production, this would use complex algorithms
    vec![
        format!("Route 1: {} -> {}", input_mint, output_mint),
        format!("Direct swap with 0.3% fee"),
    ]
}

/// Validate Solana address
pub fn validate_address(address: &str) -> bool {
    if address.len() < 32 || address.len() > 44 {
        return false;
    }
    
    // Check base58 characters
    address.chars().all(|c| {
        c.is_alphanumeric() && c != '0' && c != 'O' && c != 'I' && c != 'l'
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_send_intent() {
        let result = parse_intent_fast("send 5 SOL to ABC123");
        assert_eq!(result.action, "send");
        assert!(result.entities.contains_key("amount"));
        assert!(result.entities.contains_key("token"));
    }

    #[test]
    fn test_parse_swap_intent() {
        let result = parse_intent_fast("swap 10 SOL for USDC");
        assert_eq!(result.action, "swap");
        assert!(result.entities.contains_key("sourceToken"));
        assert!(result.entities.contains_key("targetToken"));
    }

    #[test]
    fn test_validate_address() {
        assert!(validate_address("DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"));
        assert!(!validate_address("invalid"));
        assert!(!validate_address(""));
    }
}
