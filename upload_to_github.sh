#!/bin/bash

# GitHub 업로드 스크립트
# 사용법: ./upload_to_github.sh "commit message"

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 GitHub 업로드 스크립트 시작${NC}"

# 커밋 메시지 확인
COMMIT_MSG="${1:-Update optimized Frida scripts}"
echo -e "${YELLOW}커밋 메시지: ${COMMIT_MSG}${NC}"

# Git 초기화 (필요한 경우)
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Git 저장소 초기화 중...${NC}"
    git init
    git branch -M main
fi

# 파일 상태 확인
echo -e "${YELLOW}파일 상태 확인 중...${NC}"
git status

# 모든 파일 추가
echo -e "${YELLOW}파일 추가 중...${NC}"
git add .

# 커밋
echo -e "${YELLOW}커밋 생성 중...${NC}"
git commit -m "$COMMIT_MSG" || echo "변경사항이 없거나 이미 커밋되었습니다."

# 원격 저장소 설정 (필요한 경우)
if ! git remote get-url origin > /dev/null 2>&1; then
    echo -e "${RED}원격 저장소가 설정되지 않았습니다.${NC}"
    echo -e "${YELLOW}다음 명령어로 원격 저장소를 설정하세요:${NC}"
    echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git"
    echo ""
    echo -e "${YELLOW}그 후 다시 이 스크립트를 실행하세요.${NC}"
    exit 1
fi

# 푸시
echo -e "${YELLOW}GitHub에 업로드 중...${NC}"
git push -u origin main

echo -e "${GREEN}✅ 업로드 완료!${NC}"
echo ""
echo -e "${YELLOW}업로드된 파일 목록:${NC}"
echo "📁 메인 파일:"
echo "  - libfrida-gadget.script_optimized.so (단일 통합 파일)"
echo "  - libfrida-gadget.config (설정 파일)"
echo ""
echo "📁 분리된 파일:"
echo "  - optimized_frida_script.js (메인 최적화 스크립트)"
echo "  - advanced_optimization.js (고급 최적화 스크립트)"
echo ""
echo "📁 문서:"
echo "  - README.md (프로젝트 설명)"
echo "  - optimization_guide.md (사용 가이드)"
echo "  - ggz_frida_analysis.md (원본 코드 분석)"
echo "  - frida_gadget_analysis.md (Frida Gadget 분석)"
echo ""
echo "📁 개발 파일:"
echo "  - .github/workflows/ci.yml (CI/CD 파이프라인)"
echo "  - .gitignore (Git 무시 파일)"
echo ""
echo -e "${GREEN}🎉 모든 최적화된 파일이 성공적으로 업로드되었습니다!${NC}"