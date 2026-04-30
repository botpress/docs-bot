import type { FC } from "react";
import type { BlockObjects } from "@botpress/webchat";
import { renderers } from "@botpress/webchat";
import SourceViewer from "./SourceViewer";
import { Context } from "./AttachedContext";

const CustomTextRenderer: FC<BlockObjects["bubble"]> = (props) => {
  const DefaultBubbleRenderer = renderers.bubble;

  type Citation = {
    citation: {
      source: {
        title: string;
        url: string;
      };
    };
  };

  const citations =
    props.metadata?.citations?.map((citation: Citation) => ({
      title: citation.citation.source.title
        ? citation.citation.source.title.replace(" - Botpress", "")
        : "Title not found",
      url: citation.citation.source.url,
    })) || [];

  // Remove duplicates based on URL
  const uniqueCitations = citations.filter(
    (
      citation: { title: string; url: string },
      index: number,
      self: { title: string; url: string }[]
    ) =>
      index ===
      self.findIndex(
        (c: { title: string; url: string }) => c.url === citation.url
      )
  );

  if (
    props.direction === "incoming" &&
    props.block.type === "text" &&
    uniqueCitations.length > 0
  ) {
    return (
      <div style={{ flexDirection: "column", maxWidth: "100%" }}>
        <DefaultBubbleRenderer {...props} />
        <SourceViewer citations={uniqueCitations} />
      </div>
    );
  }

  if (props.direction === "incoming")
    return <DefaultBubbleRenderer {...props} />;

  if (
    props.direction === "outgoing" &&
    props.block.type === "text" &&
    props.block.value &&
    JSON.parse(props.block.value).currentContext.length > 0
  )
    return (
      <div
        data-direction="outgoing"
        typeof="bubble"
        className="bpMessageBlocksBubble bubble-with-context"
      >
        <p>{props.block.text}</p>
        <Context attached={props.block.value} />
      </div>
    );

  return <DefaultBubbleRenderer {...props} />;
};

export default CustomTextRenderer;
