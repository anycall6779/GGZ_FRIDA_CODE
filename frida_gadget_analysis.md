# Frida Gadget Script 분석 - libfrida-gadget.script_12.0.json

## 개요
사용자가 제공한 `libfrida-gadget.script_12.0.json` 파일은 원래 `libfrida-gadget.so` 파일에서 추출한 스크립트를 JSON 형태로 변환한 것입니다.

## Frida Gadget이란?

**Frida Gadget**은 Frida의 공유 라이브러리 형태로, 다음과 같은 특징을 가집니다:

### 1. 기본 개념
- APK 파일 내부에 직접 삽입하여 사용하는 Frida 라이브러리
- 일반적으로 `lib/[architecture]/libfrida-gadget.so` 형태로 포함
- 앱이 시작될 때 자동으로 로드되어 Frida 기능을 제공

### 2. 동작 방식
```
APK 구조:
├── lib/
│   ├── arm64-v8a/
│   │   ├── libfrida-gadget.so
│   │   └── libfrida-gadget.script_12.0.json (설정 파일)
│   └── armeabi-v7a/
│       ├── libfrida-gadget.so
│       └── libfrida-gadget.script_12.0.json
```

### 3. 설정 파일 역할
- `.json` 확장자 파일은 Frida Gadget의 동작을 제어하는 설정 파일
- 어떤 스크립트를 실행할지, 어떤 모드로 동작할지 정의
- 파일명은 Gadget 바이너리 이름과 동일하게 맞춰야 함

## 일반적인 설정 파일 구조

### 1. Listen 모드 (기본값)
```json
{
  "interaction": {
    "type": "listen",
    "address": "127.0.0.1",
    "port": 27042,
    "on_load": "wait"
  }
}
```

### 2. Script 모드
```json
{
  "interaction": {
    "type": "script",
    "path": "/data/local/tmp/hook.js",
    "on_change": "reload"
  }
}
```

### 3. Connect 모드
```json
{
  "interaction": {
    "type": "connect",
    "address": "127.0.0.1",
    "port": 27052
  }
}
```

## APK 인젝션 과정

### 1. 준비 단계
1. APK 파일 디컴파일 (apktool 사용)
2. 적절한 아키텍처용 libfrida-gadget.so 다운로드
3. 스크립트 설정 파일 준비

### 2. 인젝션 단계
1. `lib/[architecture]/` 폴더에 `libfrida-gadget.so` 복사
2. 같은 위치에 설정 파일 (`.json`) 복사
3. 네이티브 라이브러리 로딩 코드 수정 (smali 파일 편집)
4. AndroidManifest.xml 권한 추가 (필요시)

### 3. 재패키징 단계
1. APK 재빌드 (apktool 사용)
2. APK 서명 (zipalign + apksigner)
3. 설치 및 테스트

## 실제 사용 예시

### 1. 기본 후킹 스크립트
```javascript
Java.perform(function() {
    var MainActivity = Java.use("com.example.MainActivity");
    
    MainActivity.onCreate.implementation = function(savedInstanceState) {
        console.log("[+] MainActivity.onCreate called");
        return this.onCreate(savedInstanceState);
    };
});
```

### 2. 암호화 함수 후킹
```javascript
Java.perform(function() {
    var CryptoUtils = Java.use("com.example.CryptoUtils");
    
    CryptoUtils.encrypt.implementation = function(data) {
        console.log("[+] Original data: " + data);
        var result = this.encrypt(data);
        console.log("[+] Encrypted data: " + result);
        return result;
    };
});
```

## 주의사항

### 1. 안티 프리다 우회
- 라이브러리 이름 변경 (libfrida-gadget.so → libssl.so)
- 설정 파일 이름도 함께 변경
- 패키지명 기반 탐지 우회

### 2. 권한 설정
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 3. 디버깅 모드
- 개발 중에는 `"on_change": "reload"` 옵션 사용
- 실제 배포시에는 `"on_change": "ignore"` 사용

## 분석 도구

### 1. 스크립트 추출
```bash
# .so 파일에서 스크립트 추출
strings libfrida-gadget.so | grep -E "(function|Java\.perform)"
```

### 2. 설정 파일 분석
```bash
# JSON 파일 포맷 검증
python -m json.tool libfrida-gadget.script_12.0.json
```

### 3. 동적 분석
```bash
# 실행 중인 앱에 연결
frida -U -n "com.example.app" -l analyze.js
```

## 결론

`libfrida-gadget.script_12.0.json` 파일은 Frida Gadget의 핵심 설정 파일로, APK 내부에 삽입된 Frida 스크립트의 동작을 제어합니다. 이 파일을 통해 앱의 동적 분석, 후킹, 그리고 보안 우회 등 다양한 목적으로 활용할 수 있습니다.

파일의 정확한 내용을 확인하려면 실제 JSON 파일을 열어서 설정된 interaction 타입과 매개변수들을 분석해야 합니다.