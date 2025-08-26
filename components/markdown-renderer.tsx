"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`max-w-none prose prose-gray ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 헤딩 스타일링
          h1: ({ children }) => (
            <h1 className="pb-4 mb-3 text-2xl font-bold text-gray-900 border-b-2 border-blue-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="pb-3 mb-3 text-xl font-semibold text-gray-800 border-b border-gray-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 text-lg font-medium text-gray-800">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 text-base font-medium text-gray-700">
              {children}
            </h4>
          ),

          // 문단 스타일링
          p: ({ children }) => (
            <p className="mb-1 leading-relaxed text-gray-700">{children}</p>
          ),

          // 리스트 스타일링
          ul: ({ children }) => (
            <ul className="mb-4 ml-4 space-y-1 list-disc list-inside">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-4 space-y-1 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-gray-700">{children}</li>
          ),

          // 강조 텍스트
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">{children}</em>
          ),

          // 코드 블록
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <div className="my-4">
                <SyntaxHighlighter style={vs} language={match[1]}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // 인용문
          blockquote: ({ children }) => (
            <blockquote className="py-2 pl-4 my-4 italic text-gray-700 bg-blue-50 border-l-4 border-blue-400">
              {children}
            </blockquote>
          ),

          // 구분선
          hr: () => <hr className="my-6 border-gray-300" />,

          // 링크
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // GitHub 스타일 테이블
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full bg-white rounded-lg border border-gray-200 shadow-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-gray-50">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-sm font-semibold text-left text-gray-900 bg-gray-100 border-b-2 border-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-gray-700 align-top border-b border-gray-200">
              {children}
            </td>
          ),

          // 체크박스 (GitHub 스타일)
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },

          // 취소선 (GitHub 스타일)
          del: ({ children }) => (
            <del className="text-gray-500 line-through">{children}</del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
