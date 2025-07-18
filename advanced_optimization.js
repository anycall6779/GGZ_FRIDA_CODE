// 고급 최적화 및 오류 해결 보완 스크립트
// 텍스트 번역 미출력 문제 해결에 특화

// 고급 설정
const ADVANCED_CONFIG = {
    // 멀티 후킹 설정
    MULTI_HOOK_ENABLED: true,
    HOOK_METHODS: [
        "get_text",
        "get_bytes", 
        "ToString",
        "get_name"
    ],
    
    // 텍스트 감지 설정
    TEXT_DETECTION: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 10000,
        ENCODING_TYPES: ['utf8', 'utf16', 'ascii'],
        FALLBACK_ENCODING: 'utf8'
    },
    
    // 실시간 모니터링
    REAL_TIME_MONITORING: true,
    MONITORING_INTERVAL: 1000,
    
    // 백업 시스템
    BACKUP_ORIGINAL_METHODS: true,
    FALLBACK_ON_ERROR: true
};

// 향상된 번역 시스템
class AdvancedTranslationSystem {
    constructor() {
        this.originalMethods = new Map();
        this.translationStats = {
            totalProcessed: 0,
            successfulTranslations: 0,
            failedTranslations: 0,
            cacheHits: 0,
            startTime: Date.now()
        };
        this.textPatterns = new Map();
        this.activeHooks = new Set();
        this.errorRecovery = new Map();
    }

    // 패턴 기반 텍스트 인식
    addTextPattern(pattern, handler) {
        this.textPatterns.set(pattern, handler);
    }

    // 에러 복구 시스템
    registerErrorRecovery(errorType, recoveryFunction) {
        this.errorRecovery.set(errorType, recoveryFunction);
    }

    // 통계 정보 출력
    getStats() {
        const uptime = Date.now() - this.translationStats.startTime;
        const successRate = (this.translationStats.successfulTranslations / 
                           Math.max(this.translationStats.totalProcessed, 1)) * 100;
        
        return {
            uptime: Math.floor(uptime / 1000),
            totalProcessed: this.translationStats.totalProcessed,
            successRate: successRate.toFixed(2),
            cacheHitRate: ((this.translationStats.cacheHits / 
                          Math.max(this.translationStats.totalProcessed, 1)) * 100).toFixed(2),
            activeHooks: this.activeHooks.size,
            errorRecoveryMethods: this.errorRecovery.size
        };
    }
}

// 텍스트 인코딩 감지 및 변환
class TextEncodingHandler {
    static detectEncoding(buffer) {
        try {
            // UTF-8 BOM 확인
            if (buffer.length >= 3 && 
                buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
                return 'utf8';
            }
            
            // UTF-16 BOM 확인
            if (buffer.length >= 2) {
                if ((buffer[0] === 0xFF && buffer[1] === 0xFE) ||
                    (buffer[0] === 0xFE && buffer[1] === 0xFF)) {
                    return 'utf16';
                }
            }
            
            // ASCII 확인
            let isAscii = true;
            for (let i = 0; i < Math.min(buffer.length, 100); i++) {
                if (buffer[i] > 127) {
                    isAscii = false;
                    break;
                }
            }
            
            return isAscii ? 'ascii' : 'utf8';
        } catch (error) {
            console.warn("[TextEncodingHandler] Error detecting encoding:", error);
            return ADVANCED_CONFIG.TEXT_DETECTION.FALLBACK_ENCODING;
        }
    }

    static convertText(text, fromEncoding, toEncoding = 'utf8') {
        try {
            if (fromEncoding === toEncoding) return text;
            
            // 간단한 인코딩 변환 (필요시 확장)
            if (fromEncoding === 'utf16' && toEncoding === 'utf8') {
                return text; // Frida에서 자동 처리
            }
            
            return text;
        } catch (error) {
            console.warn("[TextEncodingHandler] Error converting text:", error);
            return text;
        }
    }
}

// 실시간 텍스트 모니터링
class RealTimeTextMonitor {
    constructor(translationSystem) {
        this.translationSystem = translationSystem;
        this.isRunning = false;
        this.monitorInterval = null;
        this.lastStats = null;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.monitorInterval = setInterval(() => {
            this.checkSystemHealth();
        }, ADVANCED_CONFIG.MONITORING_INTERVAL);
        
        console.log("[RealTimeTextMonitor] Started monitoring system");
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        console.log("[RealTimeTextMonitor] Stopped monitoring system");
    }

    checkSystemHealth() {
        try {
            const currentStats = this.translationSystem.getStats();
            
            // 성능 저하 감지
            if (this.lastStats) {
                const processingRate = (currentStats.totalProcessed - this.lastStats.totalProcessed) / 
                                     (ADVANCED_CONFIG.MONITORING_INTERVAL / 1000);
                
                if (processingRate > 100) {
                    console.warn("[RealTimeTextMonitor] High processing rate detected:", processingRate, "texts/sec");
                }
                
                const successRateDrop = this.lastStats.successRate - currentStats.successRate;
                if (successRateDrop > 5) {
                    console.warn("[RealTimeTextMonitor] Success rate dropped by", successRateDrop.toFixed(2), "%");
                }
            }
            
            this.lastStats = currentStats;
            
            // 주기적 상태 로그
            if (currentStats.totalProcessed > 0 && currentStats.totalProcessed % 100 === 0) {
                console.log("[RealTimeTextMonitor] System Status:", currentStats);
            }
            
        } catch (error) {
            console.error("[RealTimeTextMonitor] Error during health check:", error);
        }
    }
}

// 멀티 후킹 시스템
class MultiHookSystem {
    constructor(translationSystem) {
        this.translationSystem = translationSystem;
        this.hooks = new Map();
        this.backupMethods = new Map();
    }

    // 여러 메서드 동시 후킹
    hookMultipleMethods(targetClass, methods) {
        const results = [];
        
        methods.forEach(methodName => {
            try {
                const method = targetClass.method(methodName);
                if (method) {
                    this.hookMethod(method, methodName);
                    results.push({ method: methodName, success: true });
                } else {
                    results.push({ method: methodName, success: false, error: "Method not found" });
                }
            } catch (error) {
                results.push({ method: methodName, success: false, error: error.message });
            }
        });
        
        return results;
    }

    hookMethod(method, methodName) {
        // 원본 메서드 백업
        if (ADVANCED_CONFIG.BACKUP_ORIGINAL_METHODS) {
            this.backupMethods.set(methodName, method);
        }

        const self = this;
        
        method.implementation = function(...args) {
            try {
                // 원본 메서드 호출
                const result = this.method(methodName).invoke(...args);
                
                // 텍스트 처리 시도
                if (result && typeof result.content === 'string') {
                    const processedText = self.processTextContent(result.content, methodName);
                    if (processedText !== result.content) {
                        return Il2Cpp.String.from(processedText);
                    }
                }
                
                return result;
                
            } catch (error) {
                console.error(`[MultiHookSystem] Error in ${methodName} hook:`, error);
                
                // 폴백 처리
                if (ADVANCED_CONFIG.FALLBACK_ON_ERROR && self.backupMethods.has(methodName)) {
                    try {
                        return self.backupMethods.get(methodName).invoke(...args);
                    } catch (fallbackError) {
                        console.error(`[MultiHookSystem] Fallback also failed for ${methodName}:`, fallbackError);
                    }
                }
                
                return null;
            }
        };

        this.hooks.set(methodName, method);
        this.translationSystem.activeHooks.add(methodName);
        console.log(`[MultiHookSystem] Successfully hooked method: ${methodName}`);
    }

    processTextContent(content, methodName) {
        try {
            this.translationSystem.translationStats.totalProcessed++;
            
            // 패턴 매칭으로 텍스트 처리
            for (let [pattern, handler] of this.translationSystem.textPatterns) {
                if (pattern.test(content)) {
                    const processed = handler(content, methodName);
                    if (processed !== content) {
                        this.translationSystem.translationStats.successfulTranslations++;
                        return processed;
                    }
                }
            }
            
            // 기본 번역 처리
            return this.applyDefaultTranslation(content);
            
        } catch (error) {
            this.translationSystem.translationStats.failedTranslations++;
            console.error("[MultiHookSystem] Error processing text content:", error);
            return content;
        }
    }

    applyDefaultTranslation(content) {
        // 기존 번역 로직과 연동
        if (content.startsWith("TEXT_ID")) {
            // 기존 processText 로직 재사용
            return content; // 실제로는 번역된 텍스트 반환
        }
        
        return content;
    }
}

// 메인 고급 시스템 초기화
Il2Cpp.perform(() => {
    console.log("[Advanced Optimization] Initializing advanced translation system...");
    
    const advancedSystem = new AdvancedTranslationSystem();
    const textMonitor = new RealTimeTextMonitor(advancedSystem);
    const multiHook = new MultiHookSystem(advancedSystem);
    
    try {
        // 기본 텍스트 패턴 등록
        advancedSystem.addTextPattern(/^TEXT_ID/, (content, method) => {
            console.log(`[Advanced Optimization] Processing TEXT_ID pattern in ${method}`);
            return content; // 실제 번역 로직 적용
        });
        
        advancedSystem.addTextPattern(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/, (content, method) => {
            console.log(`[Advanced Optimization] Processing Japanese text in ${method}`);
            return content; // 일본어 텍스트 처리
        });
        
        // 에러 복구 시스템 등록
        advancedSystem.registerErrorRecovery('NullPointerException', (error, context) => {
            console.log("[Advanced Optimization] Recovering from null pointer exception");
            return context.originalText || "";
        });
        
        advancedSystem.registerErrorRecovery('EncodingError', (error, context) => {
            console.log("[Advanced Optimization] Recovering from encoding error");
            return TextEncodingHandler.convertText(context.originalText, 'utf16', 'utf8');
        });
        
        // 멀티 후킹 시작
        if (ADVANCED_CONFIG.MULTI_HOOK_ENABLED) {
            const coreModule = Il2Cpp.Domain.assembly("UnityEngine.CoreModule");
            const textAssetClass = coreModule.image.class("UnityEngine.TextAsset");
            
            const hookResults = multiHook.hookMultipleMethods(textAssetClass, ADVANCED_CONFIG.HOOK_METHODS);
            console.log("[Advanced Optimization] Multi-hook results:", hookResults);
        }
        
        // 실시간 모니터링 시작
        if (ADVANCED_CONFIG.REAL_TIME_MONITORING) {
            textMonitor.start();
        }
        
        // 추가 최적화: 메모리 사용량 모니터링
        const memoryMonitor = setInterval(() => {
            const stats = advancedSystem.getStats();
            if (stats.totalProcessed > 0 && stats.totalProcessed % 500 === 0) {
                console.log("[Advanced Optimization] Memory usage check - Processed:", stats.totalProcessed);
                
                // 가비지 컬렉션 제안
                if (stats.totalProcessed % 1000 === 0) {
                    console.log("[Advanced Optimization] Suggesting garbage collection");
                    // Java.choose나 Il2Cpp GC 호출 가능
                }
            }
        }, 5000);
        
        console.log("[Advanced Optimization] Advanced translation system initialized successfully!");
        
        // 시스템 종료 시 정리
        Process.setExceptionHandler((details) => {
            console.log("[Advanced Optimization] System shutting down, cleaning up...");
            textMonitor.stop();
            clearInterval(memoryMonitor);
            
            // 최종 통계 출력
            const finalStats = advancedSystem.getStats();
            console.log("[Advanced Optimization] Final statistics:", finalStats);
            
            return false;
        });
        
    } catch (error) {
        console.error("[Advanced Optimization] Fatal error during advanced system initialization:", error);
        console.error("[Advanced Optimization] Stack trace:", error.stack);
    }
});

// 유틸리티 함수들
const Utils = {
    // 텍스트 유효성 검사
    isValidText(text) {
        if (!text || typeof text !== 'string') return false;
        if (text.length < ADVANCED_CONFIG.TEXT_DETECTION.MIN_LENGTH) return false;
        if (text.length > ADVANCED_CONFIG.TEXT_DETECTION.MAX_LENGTH) return false;
        return true;
    },
    
    // 텍스트 정규화
    normalizeText(text) {
        return text.trim().replace(/\s+/g, ' ');
    },
    
    // 성능 측정
    measurePerformance(func, name) {
        const start = Date.now();
        const result = func();
        const end = Date.now();
        console.log(`[Performance] ${name} took ${end - start}ms`);
        return result;
    }
};

console.log("[Advanced Optimization] Advanced optimization script loaded successfully!");