-- Create ai_prompts table to allow dynamic prompt updates without redeploys
create table if not exists public.ai_prompts (
  key text primary key,
  title text,
  content text not null,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now()
);

-- Enable RLS (policies can be tightened later)
alter table public.ai_prompts enable row level security;

-- Permissive policies for now: allow read to anon/authenticated, updates via service role
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_prompts' and policyname = 'ai_prompts_read'
  ) then
    create policy ai_prompts_read on public.ai_prompts
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- Seed default keys if not present
insert into public.ai_prompts(key, title, content)
select 'gpt_basic_prompt', 'GPT 기본 분석 프롬프트', '너는 글로벌 IB(투자은행) 출신의 시니어 컨설턴트로서, 골드만삭스 수준의 정밀성과 구조화로 기업 분석 리포트를 작성한다.\n\n요청 기업 정보:\n- 회사명: {{company_name}}\n- 업종: {{industry}}\n- 타겟 국가: {{target_countries}}\n- 회사 설명: {{company_description}}\n- 제품/서비스: {{product_info}}\n- 시장 경험: {{market_info}}\n- PDF 요약(참고용): {{pdf_summary}}\n{{excel_context}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n'
where not exists (select 1 from public.ai_prompts where key = 'gpt_basic_prompt');

insert into public.ai_prompts(key, title, content)
select 'gpt_market_prompt', 'GPT 마켓 리서치 프롬프트', '너는 골드만삭스 리서치 퀄리티의 마켓 애널리스트다. 최신 공개자료/뉴스/규제문서/공시/애널리스트 노트를 교차검증하여 시장조사를 수행하라.\n\n대상 기업: {{company_name}}\n업종: {{industry}}\n타겟 국가: {{target_countries}}\nPDF 요약(참고용): {{pdf_summary}}\n{{excel_context}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n'
where not exists (select 1 from public.ai_prompts where key = 'gpt_market_prompt');

insert into public.ai_prompts(key, title, content)
select 'perplexity_market_prompt', 'Perplexity 실시간 시장조사 프롬프트', '너는 골드만삭스 리서치 퀄리티의 실시간 마켓 애널리스트다. 웹 최신 정보를 교차 확인하여 시장조사를 수행하라.\n\n대상 기업: {{company_name}}\n업종: {{industry}}\n타겟 국가: {{target_countries}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n'
where not exists (select 1 from public.ai_prompts where key = 'perplexity_market_prompt');


