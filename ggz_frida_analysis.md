# GGZ Frida Code 분석 - libfrida-gadget.script_12.0.json

## 파일 개요
- **출처**: https://github.com/anycall6779/GGZ_FRIDA_CODE/blob/main/libfrida-gadget.script_12.0.json
- **목적**: Unity 게임의 텍스트 번역 시스템 후킹
- **대상**: Il2Cpp 기반 Unity 게임

## 코드 구조 분석

### 1. 라이브러리 임포트
```javascript
var import_frida_il2cpp_bridge = __toESM(require_dist2(), 1);
```
- **frida-il2cpp-bridge** 라이브러리 사용
- Il2Cpp Unity 게임 분석을 위한 전용 라이브러리

### 2. 번역 데이터
```javascript
var translation_default = {
    "1": "스킬 1",
    "1000": "흥♪ 드디어 잡았어!",
    "10000": "Roguelike（仮）",
    // ... 더 많은 번역 데이터
};
```
- 텍스트 ID와 한국어 번역 매핑
- 게임 내 텍스트를 실시간으로 번역

### 3. 핵심 후킹 로직

#### Assembly 및 Image 획득
```javascript
Il2Cpp.perform(() => {
    var img = Il2Cpp.Domain.assembly("Assembly-CSharp").image;
    var coreModule = Il2Cpp.Domain.assembly("UnityEngine.CoreModule").image;
    var get_text = coreModule.class("UnityEngine.TextAsset").method("get_text");
```

#### 텍스트 후킹 구현
```javascript
get_text.implementation = function() {
    let txt = this.method("get_text").invoke();
    let rawTxt = txt.content;
    
    if (rawTxt?.startsWith("TEXT_ID")) {
        // 텍스트 파싱 및 번역 로직
        let splits = rawTxt.split("\r\n");
        
        // 캐싱 시스템
        if (textMapReplaced.hasOwnProperty(splits[4])) {
            return Il2Cpp.String.from(textMapReplaced[splits[4]]);
        }
        
        // 새로운 번역 텍스트 생성
        let newTxt = splits[0] + "\r\n" + splits[1] + "\r\n" + splits[2] + "\r\n" + splits[3] + "\r\n";
        
        for (let i = 4; i < splits.length; i++) {
            let sSplit = splits[i].split("        ");
            if (retranslated.hasOwnProperty(sSplit[0])) {
                newTxt += sSplit[0] + "     " + retranslated[sSplit[0]] + " " + sSplit[2] + "\r\n";
            } else {
                newTxt += splits[i] + "\r\n";
            }
        }
        
        textMapReplaced[splits[4]] = newTxt;
        return Il2Cpp.String.from(newTxt);
    }
    
    return txt;
};
```

## 기술적 특징

### 1. Il2Cpp 후킹
- **대상**: `UnityEngine.TextAsset.get_text()` 메서드
- **방식**: 메서드 implementation 교체
- **효과**: 모든 텍스트 에셋 로딩 시 번역 적용

### 2. 텍스트 파싱 시스템
- **포맷**: `TEXT_ID`로 시작하는 특정 형식의 텍스트 파일
- **구조**: 
  ```
  TEXT_ID
  [헤더 정보]
  [메타데이터]
  [분류 정보]
  [실제 텍스트 데이터]
  ```

### 3. 캐싱 메커니즘
```javascript
let textMapReplaced = {};
if (textMapReplaced.hasOwnProperty(splits[4])) {
    return Il2Cpp.String.from(textMapReplaced[splits[4]]);
}
```
- 이미 번역된 텍스트는 캐시에서 재사용
- 성능 최적화를 위한 설계

### 4. 동적 번역 시스템
```javascript
if (retranslated.hasOwnProperty(sSplit[0])) {
    newTxt += sSplit[0] + "     " + retranslated[sSplit[0]] + " " + sSplit[2] + "\r\n";
} else {
    newTxt += splits[i] + "\r\n";
}
```
- 번역 데이터가 있는 경우에만 교체
- 원본 텍스트 보존

## 사용 시나리오

### 1. 게임 번역 패치
- 일본어/영어 게임을 한국어로 번역
- 실시간 텍스트 교체
- 게임 파일 수정 없이 번역 적용

### 2. 텍스트 모딩
- 게임 내 텍스트 커스터마이징
- 특정 문구 변경
- 유저 정의 번역 적용

## 장점과 한계

### 장점
1. **비침습적**: 게임 파일 직접 수정 불필요
2. **실시간**: 게임 실행 중 즉시 적용
3. **선택적**: 특정 텍스트만 번역 가능
4. **확장성**: 번역 데이터 쉽게 추가/수정 가능

### 한계
1. **Il2Cpp 전용**: Unity Il2Cpp 빌드만 지원
2. **포맷 의존성**: 특정 텍스트 포맷에 의존
3. **성능 오버헤드**: 모든 텍스트 로딩 시 후킹 발생

## 실제 적용 방법

### 1. APK 인젝션
```bash
# libfrida-gadget.so와 함께 APK에 삽입
lib/arm64-v8a/libfrida-gadget.so
lib/arm64-v8a/libfrida-gadget.script_12.0.json
```

### 2. 설정 파일 생성
```json
{
  "interaction": {
    "type": "script",
    "path": "libfrida-gadget.script_12.0.json"
  }
}
```

### 3. 번역 데이터 확장
```javascript
var translation_default = {
    "새로운_텍스트_ID": "번역된 텍스트",
    "다른_ID": "다른 번역",
    // 계속 추가 가능
};
```

## 보안 고려사항

### 1. 안티 치트 우회
- 메모리 패치 방식으로 파일 무결성 검사 우회
- 런타임 수정으로 정적 분석 방지

### 2. 탐지 방지
- 게임 파일 직접 수정 없음
- 메모리상에서만 동작

## 결론

이 스크립트는 Unity Il2Cpp 게임의 텍스트 번역을 위한 매우 정교한 Frida 스크립트입니다. 
게임 해킹이나 모딩 목적이 아닌, 사용자 편의를 위한 번역 도구로 설계되었으며, 
기술적으로도 매우 완성도가 높은 코드입니다.

특히 Il2Cpp 후킹, 텍스트 파싱, 캐싱 시스템 등이 잘 구현되어 있어 
Frida를 이용한 게임 모딩의 좋은 예시가 될 수 있습니다.