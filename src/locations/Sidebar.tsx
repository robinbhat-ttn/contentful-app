import React, { useState, useEffect, useCallback } from 'react';
import { List, ListItem, Note } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';

const CONTENT_FIELD_ID = 'body';
const WORDS_PER_MINUTE = 200;

interface ReadingStats {
  words: number;
  text: string;
}

interface BlockNode {
  data: Record<string, any>;
  content: BlockNode[];
  nodeType: string;
}

interface RichTextDocumentNode {
  content: BlockNode[];
  data: Record<string, any>;
  nodeType: 'document';
}

const Sidebar: React.FC = () => {
  const sdk = useSDK<any>();
  const contentField = sdk.entry.fields[CONTENT_FIELD_ID] ;

  const convertRichTextToString = useCallback((value: RichTextDocumentNode | null): string => {
    if (!value?.content?.[0]?.content) return '';
    // console.log("Value: ", value);
    
    let stringText = '';
    value.content.forEach((element: any) => {
      element?.content.forEach((ele: any) => {
        stringText += ele.value || '';
      })
    });
    // console.log("String Text: ", stringText);
    return stringText;
  }, []);

  const [blogText, setBlogText] = useState<string>(
    convertRichTextToString(contentField.getValue())
  );

  useEffect(() => {
    const detach = contentField.onValueChanged((value: RichTextDocumentNode | null) => {
      setBlogText(convertRichTextToString(value));
    });
    
    return () => {
      detach();
    };
  }, [contentField, convertRichTextToString]);

  const readingTime = useCallback((text: string): ReadingStats => {
    const wordCount = text.split(' ').filter(Boolean).length;
    const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
    return {
      words: wordCount,
      text: `${minutes} min read`,
    };
  }, []);

  const stats = readingTime(blogText || '');

  return (
    <>
      <Note style={{ marginBottom: '12px' }}>
        Metrics for your blog post:
        <List style={{ marginTop: '12px' }}>
          <ListItem>Word count: {stats.words}</ListItem>
          <ListItem>Reading time: {stats.text}</ListItem>
        </List>
      </Note>
    </>
  );
};

export default Sidebar;
