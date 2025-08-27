"use client";

// TODO: refactor using context
// TODO: add valid util

import { useState } from "react";
import { URLParserClient } from "../_utils";
import { type SummarizedContent } from "../_types";

export const useNewsAnalyze = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<SummarizedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const parsed = await URLParserClient.parseUrlWithSummary(url);
      setResult(parsed);
      setUrl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "네트워크 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    url,
    setUrl,
    result,
    loading,
    error,
    handleAnalyze,
  };
};
