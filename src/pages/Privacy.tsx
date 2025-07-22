import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">KB</span>
              </div>
              <span className="text-xl font-bold text-primary">KnowWhere Bridge Matching 서비스</span>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">개인정보 처리방침</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>1. 개인정보 수집 및 이용 목적</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">회원 가입 및 관리</h4>
                  <p className="text-muted-foreground">회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원 자격 유지·관리, 서비스 부정 이용 방지 등</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">서비스 제공</h4>
                  <p className="text-muted-foreground">잠재 고객 발굴, 현지 파트너 소개, 투자자 연결 등 노웨어브릿지의 서비스 제공</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">민원 처리</h4>
                  <p className="text-muted-foreground">민원인의 신원 확인, 민원 사항 확인, 사실 조사를 위한 연락·통지, 처리 결과 통보 등</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">마케팅 및 광고에의 활용</h4>
                  <p className="text-muted-foreground">신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여 기회 제공, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계 등</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>2. 수집하는 개인정보의 항목</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">필수 항목</h4>
                  <p className="text-muted-foreground">이름, 생년월일, 로그인ID, 비밀번호, 휴대전화번호, 이메일, 회사명, 직책, 회사 주소, 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">선택 항목</h4>
                  <p className="text-muted-foreground">직업, 관심 분야, 기타 추가 정보</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>3. 개인정보의 보유 및 이용 기간</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  원칙적으로, 회원정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">회원 탈퇴 시까지</h4>
                  <p className="text-muted-foreground">회원 관리 및 서비스 제공을 위해 회원 탈퇴 시까지 보유</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">관련 법령에 의한 정보 보유 사유</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
                    <li>대금 결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
                    <li>소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>4. 개인정보의 제3자 제공에 관한 사항</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  회사는 원칙적으로 정보주체의 회원정보를 제1조에서 명시한 목적 범위 내에서 처리하며, 정보주체의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">다만, 다음의 경우에는 예외로 합니다:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>정보주체로부터 별도의 동의를 받은 경우</li>
                    <li>법률에 특별한 규정이 있는 경우</li>
                    <li>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소 불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>5. 개인정보 보호를 위한 조치</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">기술적 대책</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>개인정보 암호화</li>
                    <li>보안 프로그램 설치 및 갱신</li>
                    <li>접근 통제 및 권한 관리</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">관리적 대책</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>개인정보 취급 직원의 최소화 및 교육</li>
                    <li>내부 관리 계획 수립 및 시행</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>6. 개인정보 보호책임자 및 연락처</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>이름:</strong> 홍동표</p>
                  <p><strong>직책:</strong> 대표</p>
                  <p><strong>연락처:</strong> 02-525-7121</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>7. 고지의 의무</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  현 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전에 홈페이지의 '공지사항'을 통해 고지할 것입니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. 동의를 거부할 권리 및 동의 거부에 따른 불이익</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  귀하는 회원정보 수집 및 이용 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한 동의를 거부할 경우 회원 가입 및 서비스 이용이 불가능할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}