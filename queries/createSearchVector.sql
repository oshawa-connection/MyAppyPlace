ALTER TABLE "happyThought" ADD COLUMN "_search" TSVECTOR;

UPDATE "happyThought" 
SET "_search" = to_tsvector('english', "thoughtText");

CREATE TRIGGER search_vector_update
BEFORE INSERT OR UPDATE ON "happyThought"
FOR EACH ROW 
EXECUTE PROCEDURE tsvector_update_trigger("_search", 'pg_catalog.english', "thoughtText");

commit;

