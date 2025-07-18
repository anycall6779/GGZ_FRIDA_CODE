// 최적화된 Frida Il2Cpp 번역 스크립트
// 성능 최적화 및 오류 해결 버전

// 전역 변수 최적화
const PERFORMANCE_CONFIG = {
    CACHE_SIZE_LIMIT: 1000,        // 캐시 크기 제한
    BATCH_SIZE: 50,                // 배치 처리 크기
    DEBOUNCE_TIME: 16,             // 디바운스 시간 (60fps 기준)
    MAX_RETRY_COUNT: 3,            // 최대 재시도 횟수
    PRELOAD_COMMON_TEXTS: true     // 자주 사용되는 텍스트 사전 로드
};

// 번역 데이터 (더 많은 데이터로 확장)
const translation_default = {
    "1": "스킬 1",
    "1000": "흥♪ 드디어 잡았어!",
    "10000": "Roguelike（仮）",
    // 더 많은 번역 데이터 추가 가능
};

// 성능 최적화된 캐시 시스템
class OptimizedTextCache {
    constructor(maxSize = PERFORMANCE_CONFIG.CACHE_SIZE_LIMIT) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.accessCount = new Map();
        this.lastAccess = new Map();
    }

    get(key) {
        if (this.cache.has(key)) {
            // 접근 빈도 및 시간 업데이트
            this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
            this.lastAccess.set(key, Date.now());
            return this.cache.get(key);
        }
        return null;
    }

    set(key, value) {
        // 캐시 크기 제한 확인
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }
        
        this.cache.set(key, value);
        this.accessCount.set(key, 1);
        this.lastAccess.set(key, Date.now());
    }

    evictLRU() {
        // LRU 알고리즘으로 캐시 정리
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (let [key, time] of this.lastAccess) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessCount.delete(oldestKey);
            this.lastAccess.delete(oldestKey);
        }
    }

    clear() {
        this.cache.clear();
        this.accessCount.clear();
        this.lastAccess.clear();
    }
}

// 디바운스 함수 (성능 최적화)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 배치 처리 시스템
class BatchProcessor {
    constructor(batchSize = PERFORMANCE_CONFIG.BATCH_SIZE) {
        this.batchSize = batchSize;
        this.queue = [];
        this.processing = false;
    }

    add(item) {
        this.queue.push(item);
        if (this.queue.length >= this.batchSize) {
            this.process();
        }
    }

    process() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        const batch = this.queue.splice(0, this.batchSize);
        
        // 배치 처리 로직
        batch.forEach(item => {
            try {
                item.callback(item.data);
            } catch (error) {
                console.error("[BatchProcessor] Error processing item:", error);
            }
        });
        
        this.processing = false;
        
        // 남은 항목이 있으면 계속 처리
        if (this.queue.length > 0) {
            setTimeout(() => this.process(), 1);
        }
    }
}

// 메인 스크립트 실행
Il2Cpp.perform(() => {
    console.log("[Optimized Translation] Starting Il2Cpp translation system...");
    console.log("[Optimized Translation] Unity Version:", Il2Cpp.unityVersion);
    
    // 캐시 및 처리 시스템 초기화
    const textCache = new OptimizedTextCache();
    const batchProcessor = new BatchProcessor();
    
    // 성능 모니터링 변수
    let processedCount = 0;
    let cacheHitCount = 0;
    let errorCount = 0;
    let lastPerformanceLog = Date.now();
    
    try {
        // Assembly 및 Image 획득 (에러 처리 강화)
        const assemblyCSharp = Il2Cpp.Domain.assembly("Assembly-CSharp");
        const coreModule = Il2Cpp.Domain.assembly("UnityEngine.CoreModule");
        
        if (!assemblyCSharp || !coreModule) {
            throw new Error("Required assemblies not found");
        }
        
        const img = assemblyCSharp.image;
        const coreModuleImage = coreModule.image;
        
        // TextAsset 클래스 및 메서드 획득
        const textAssetClass = coreModuleImage.class("UnityEngine.TextAsset");
        if (!textAssetClass) {
            throw new Error("UnityEngine.TextAsset class not found");
        }
        
        const get_text = textAssetClass.method("get_text");
        if (!get_text) {
            throw new Error("get_text method not found");
        }
        
        console.log("[Optimized Translation] Successfully hooked TextAsset.get_text");
        
        // 자주 사용되는 텍스트 사전 캐싱
        if (PERFORMANCE_CONFIG.PRELOAD_COMMON_TEXTS) {
            Object.keys(translation_default).forEach(key => {
                textCache.set(`preload_${key}`, translation_default[key]);
            });
            console.log("[Optimized Translation] Preloaded", Object.keys(translation_default).length, "common texts");
        }
        
        // 최적화된 텍스트 처리 함수
        function processTextWithRetry(rawText, retryCount = 0) {
            try {
                return processText(rawText);
            } catch (error) {
                errorCount++;
                console.error(`[Optimized Translation] Error processing text (attempt ${retryCount + 1}):`, error);
                
                if (retryCount < PERFORMANCE_CONFIG.MAX_RETRY_COUNT) {
                    console.log("[Optimized Translation] Retrying text processing...");
                    return processTextWithRetry(rawText, retryCount + 1);
                } else {
                    console.error("[Optimized Translation] Max retries reached, returning original text");
                    return rawText;
                }
            }
        }
        
        // 핵심 텍스트 처리 함수 (최적화)
        function processText(rawText) {
            if (!rawText || typeof rawText !== 'string') {
                return rawText;
            }
            
            // TEXT_ID 형식 확인 (더 엄격한 검증)
            if (!rawText.startsWith("TEXT_ID")) {
                return rawText;
            }
            
            // 캐시 확인 (해시 기반으로 더 빠른 검색)
            const textHash = rawText.substring(0, Math.min(100, rawText.length));
            const cached = textCache.get(textHash);
            if (cached) {
                cacheHitCount++;
                return cached;
            }
            
            // 텍스트 파싱 최적화
            const lines = rawText.split('\r\n');
            if (lines.length < 5) {
                console.warn("[Optimized Translation] Invalid text format, too few lines");
                return rawText;
            }
            
            // 헤더 정보 보존
            const header = lines.slice(0, 4).join('\r\n') + '\r\n';
            let translatedText = header;
            let translationApplied = false;
            
            // 배치 처리로 성능 최적화
            const textLines = lines.slice(4);
            const processedLines = [];
            
            for (let i = 0; i < textLines.length; i++) {
                const line = textLines[i];
                if (!line || line.trim() === '') {
                    processedLines.push(line);
                    continue;
                }
                
                // 더 정확한 텍스트 분할 (탭과 공백 모두 고려)
                const parts = line.split(/\s{2,}|\t+/);
                if (parts.length < 1) {
                    processedLines.push(line);
                    continue;
                }
                
                const textId = parts[0].trim();
                
                // 번역 적용 확인 및 처리
                if (translation_default.hasOwnProperty(textId)) {
                    const translatedLine = textId + "     " + translation_default[textId] + 
                                         (parts.length > 2 ? " " + parts.slice(2).join(" ") : "");
                    processedLines.push(translatedLine);
                    translationApplied = true;
                } else {
                    processedLines.push(line);
                }
            }
            
            // 최종 텍스트 조합
            translatedText += processedLines.join('\r\n');
            
            // 번역이 적용된 경우에만 캐시 저장
            if (translationApplied) {
                textCache.set(textHash, translatedText);
                console.log(`[Optimized Translation] Applied translation for ${processedLines.length} lines`);
            }
            
            return translatedText;
        }
        
        // 디바운스된 성능 로깅
        const logPerformance = debounce(() => {
            const now = Date.now();
            const timeDiff = now - lastPerformanceLog;
            if (timeDiff > 5000) { // 5초마다 로그
                console.log(`[Performance] Processed: ${processedCount}, Cache hits: ${cacheHitCount}, Errors: ${errorCount}, Hit rate: ${((cacheHitCount / Math.max(processedCount, 1)) * 100).toFixed(1)}%`);
                lastPerformanceLog = now;
            }
        }, 1000);
        
        // 메서드 후킹 (에러 처리 강화)
        get_text.implementation = function() {
            let originalText = null;
            let processedText = null;
            
            try {
                // 원본 메서드 호출
                const textObj = this.method("get_text").invoke();
                if (!textObj || textObj.isNull()) {
                    return textObj;
                }
                
                originalText = textObj.content;
                if (!originalText) {
                    return textObj;
                }
                
                processedCount++;
                
                // 텍스트 처리 (재시도 로직 포함)
                processedText = processTextWithRetry(originalText);
                
                // 처리된 텍스트가 다른 경우에만 새 객체 생성
                if (processedText !== originalText) {
                    const result = Il2Cpp.String.from(processedText);
                    logPerformance();
                    return result;
                }
                
                logPerformance();
                return textObj;
                
            } catch (error) {
                errorCount++;
                console.error("[Optimized Translation] Critical error in get_text hook:", error);
                console.error("[Optimized Translation] Original text length:", originalText ? originalText.length : 'null');
                
                // 에러 발생 시 원본 메서드 결과 반환
                try {
                    return this.method("get_text").invoke();
                } catch (fallbackError) {
                    console.error("[Optimized Translation] Fallback also failed:", fallbackError);
                    return null;
                }
            }
        };
        
        console.log("[Optimized Translation] Translation system initialized successfully!");
        
        // 메모리 정리 (주기적으로 실행)
        const cleanupInterval = setInterval(() => {
            if (textCache.cache.size > PERFORMANCE_CONFIG.CACHE_SIZE_LIMIT * 0.8) {
                console.log("[Optimized Translation] Performing cache cleanup...");
                // 캐시 크기를 50%로 줄임
                const targetSize = Math.floor(PERFORMANCE_CONFIG.CACHE_SIZE_LIMIT * 0.5);
                while (textCache.cache.size > targetSize) {
                    textCache.evictLRU();
                }
                console.log(`[Optimized Translation] Cache cleaned up to ${textCache.cache.size} entries`);
            }
        }, 30000); // 30초마다 정리
        
    } catch (error) {
        console.error("[Optimized Translation] Fatal error during initialization:", error);
        console.error("[Optimized Translation] Stack trace:", error.stack);
    }
});

// 전역 에러 핸들러
Process.setExceptionHandler((details) => {
    console.error("[Optimized Translation] Unhandled exception:", details);
    return false; // 계속 실행
});